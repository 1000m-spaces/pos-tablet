import AsyncStorage from '../store/async_storage';
import printingService from './PrintingService';

class PrintQueueService {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.listeners = [];
        this.maxRetries = 3;
        this.retryDelay = 2000; // 2 seconds
        this.captureCallback = null; // Callback function to request snapshots from Main component
    }

    // Set capture callback function from Main component
    setCaptureCallback(callback) {
        this.captureCallback = callback;
    }

    // Add a print task to the queue
    addPrintTask(task) {
        const taskId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const printTask = {
            id: taskId,
            ...task,
            status: 'queued',
            retries: 0,
            createdAt: new Date().toISOString(),
        };

        this.queue.push(printTask);
        this.notifyListeners('taskAdded', printTask);

        // Start processing if not already processing
        if (!this.isProcessing) {
            this.processQueue();
        }

        return taskId;
    }

    // Process the print queue
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        this.notifyListeners('processingStarted');

        while (this.queue.length > 0) {
            const task = this.queue[0];

            try {
                await this.processTask(task);
                // Remove successful task from queue
                this.queue.shift();
                this.notifyListeners('taskCompleted', task);
            } catch (error) {
                console.error('Print task failed:', error);

                // Handle retry logic
                task.retries += 1;
                task.lastError = error.message;
                task.status = 'retrying';

                if (task.retries >= this.maxRetries) {
                    // Max retries reached, remove from queue and mark as failed
                    task.status = 'failed';
                    this.queue.shift();
                    this.notifyListeners('taskFailed', task);
                } else {
                    // Retry after delay
                    this.notifyListeners('taskRetrying', task);
                    await this.delay(this.retryDelay);
                }
            }
        }

        this.isProcessing = false;
        this.notifyListeners('processingCompleted');
    }

    // Process individual print task
    async processTask(task) {
        task.status = 'processing';
        this.notifyListeners('taskProcessing', task);

        if (!this.captureCallback) {
            throw new Error('Capture callback not available. Main component must set capture callback.');
        }

        // Wait for ViewShot components to be ready with the order data
        await this.delay(1000);

        switch (task.type) {
            case 'label':
                await this.printLabel(task);
                break;
            case 'bill':
                await this.printBill(task);
                break;
            case 'both':
                await this.printBoth(task);
                break;
            default:
                throw new Error(`Unknown print task type: ${task.type}`);
        }

        task.status = 'completed';
        task.completedAt = new Date().toISOString();
    }

    // Print label using image data from Main component
    async printLabel(task) {
        const { order, printerInfo, metadata } = task;

        if (!printerInfo) {
            throw new Error('Printer info not available for label printing');
        }

        try {
            // Prepare options for handleCaptureSnapshot based on metadata
            let options = {};
            if (metadata && metadata.isMultiLabel) {
                options = {
                    productIndex: metadata.productIndex,
                    labelIndex: metadata.labelIndex,
                    totalLabels: metadata.totalLabels
                };
                console.log(`PrintQueue: Printing label for product "${metadata.productName}" - Label ${metadata.labelIndex + 1}/${metadata.totalLabels}`);
            } else {
                // Single label print (backward compatibility)
                options = {
                    productIndex: 0,
                    labelIndex: 0,
                    totalLabels: 1
                };
            }

            // Request label snapshot from Main component with proper options
            const uri = await this.captureCallback('label', order, options);

            if (!uri) {
                throw new Error('Failed to capture label snapshot');
            }

            // Print using the printing service
            await printingService.printLabel(uri, printerInfo);

            // Save print record with metadata
            await this.savePrintRecord(order, 'label', true, null, metadata);

        } catch (error) {
            console.error('Label printing error:', error);
            await this.savePrintRecord(order, 'label', false, error.message, metadata);
            throw error;
        }
    }

    // Print bill using image data from Main component
    async printBill(task) {
        const { order } = task;

        try {
            // Request bill snapshot from Main component
            const base64 = await this.captureCallback('bill', order);

            if (!base64) {
                throw new Error('Failed to capture bill snapshot');
            }

            // Print using the printing service
            await printingService.printBill(base64);

            // Save print record
            await this.savePrintRecord(order, 'bill', true);

        } catch (error) {
            console.error('Bill printing error:', error);
            await this.savePrintRecord(order, 'bill', false, error.message);
            throw error;
        }
    }

    // Print both label and bill
    async printBoth(task) {
        const { order, printerInfo } = task;

        try {
            // Print label first
            if (printerInfo) {
                await this.printLabel({ order, printerInfo });
            }

            // Then print bill
            await this.printBill({ order });

        } catch (error) {
            throw error;
        }
    }

    // Save print record to AsyncStorage
    async savePrintRecord(order, type, success, error = null, metadata = null) {
        try {
            const printRecord = {
                orderId: order.session || order.offlineOrderId,
                type,
                success,
                error,
                timestamp: new Date().toISOString(),
                orderData: {
                    session: order.session,
                    total_amount: order.total_amount,
                    shopTableName: order.shopTableName
                },
                // Include metadata for tracking individual labels
                metadata: metadata ? {
                    productIndex: metadata.productIndex,
                    labelIndex: metadata.labelIndex,
                    totalLabels: metadata.totalLabels,
                    productName: metadata.productName,
                    isMultiLabel: metadata.isMultiLabel
                } : null
            };

            // Get existing print records
            const existingRecords = await AsyncStorage.getPrintRecords() || [];
            existingRecords.push(printRecord);

            // Keep only last 100 records to prevent storage bloat
            const trimmedRecords = existingRecords.slice(-100);

            await AsyncStorage.setPrintRecords(trimmedRecords);
        } catch (error) {
            console.error('Error saving print record:', error);
        }
    }

    // Add listener for queue events
    addListener(callback) {
        this.listeners.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners
    notifyListeners(event, data = null) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in print queue listener:', error);
            }
        });
    }

    // Get queue status
    getQueueStatus() {
        return {
            isProcessing: this.isProcessing,
            queueLength: this.queue.length,
            tasks: this.queue.map(task => ({
                id: task.id,
                type: task.type,
                status: task.status,
                retries: task.retries,
                createdAt: task.createdAt
            }))
        };
    }

    // Clear failed tasks from queue
    clearFailedTasks() {
        const beforeLength = this.queue.length;
        this.queue = this.queue.filter(task => task.status !== 'failed');
        const afterLength = this.queue.length;

        if (beforeLength !== afterLength) {
            this.notifyListeners('failedTasksCleared', { removed: beforeLength - afterLength });
        }
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get print statistics
    async getPrintStatistics() {
        try {
            const printRecords = await AsyncStorage.getPrintRecords() || [];

            const stats = {
                total: printRecords.length,
                successful: printRecords.filter(r => r.success).length,
                failed: printRecords.filter(r => !r.success).length,
                byType: {
                    label: printRecords.filter(r => r.type === 'label').length,
                    bill: printRecords.filter(r => r.type === 'bill').length
                }
            };

            return stats;
        } catch (error) {
            console.error('Error getting print statistics:', error);
            return { total: 0, successful: 0, failed: 0, byType: { label: 0, bill: 0 } };
        }
    }
}

// Create singleton instance
const printQueueService = new PrintQueueService();

export default printQueueService;
