import { getOrderIdentifierForPrinting } from 'utils/orderUtils';
import AsyncStorage from '../store/async_storage';
import printingService from './PrintingService';

class PrintQueueService {
    constructor() {
        // Separate queues for labels and bills to allow concurrent processing
        this.labelQueue = [];
        this.billQueue = [];
        // Failed tasks storage
        this.failedTasks = [];
        // Lock mechanism to prevent race conditions
        this.labelLock = null; // Promise that resolves when label processing is done
        this.billLock = null; // Promise that resolves when bill processing is done
        this.listeners = [];
        this.maxRetries = 5; // Increased to 5 retries
        this.retryDelay = 2000; // 2 seconds
        this.captureCallback = null; // Callback function to request snapshots from Main component
        // Load failed tasks from storage
        this.loadFailedTasks();
    }

    // Set capture callback function from Main component
    setCaptureCallback(callback) {
        this.captureCallback = callback;
    }

    // Load failed tasks from AsyncStorage
    async loadFailedTasks() {
        try {
            const storedFailedTasks = await AsyncStorage.getFailedPrintTasks();
            if (storedFailedTasks && Array.isArray(storedFailedTasks)) {
                this.failedTasks = storedFailedTasks;
                console.log(`Loaded ${this.failedTasks.length} failed print tasks from storage`);
            }
        } catch (error) {
            console.error('Error loading failed tasks:', error);
            this.failedTasks = [];
        }
    }

    // Save failed tasks to AsyncStorage
    async saveFailedTasks() {
        try {
            await AsyncStorage.setFailedPrintTasks(this.failedTasks);
        } catch (error) {
            console.error('Error saving failed tasks:', error);
        }
    }

    // Add a print task to the appropriate queue
    addPrintTask(task) {
        const taskId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const printTask = {
            id: taskId,
            ...task,
            status: 'queued',
            retries: 0,
            createdAt: new Date().toISOString(),
        };

        // Route tasks to appropriate queues
        if (task.type === 'label') {
            this.labelQueue.push(printTask);
            this.notifyListeners('taskAdded', { ...printTask, queueType: 'label' });

            // Start label processing (lock mechanism ensures only one runs at a time)
            this.processLabelQueue();
        } else if (task.type === 'bill') {
            this.billQueue.push(printTask);
            this.notifyListeners('taskAdded', { ...printTask, queueType: 'bill' });

            // Start bill processing (lock mechanism ensures only one runs at a time)
            this.processBillQueue();
        } else if (task.type === 'both') {
            // Split 'both' type into separate label and bill tasks
            const labelTaskId = taskId + '_label';
            const billTaskId = taskId + '_bill';

            const labelTask = {
                id: labelTaskId,
                ...task,
                type: 'label',
                status: 'queued',
                retries: 0,
                createdAt: new Date().toISOString(),
                parentTaskId: taskId
            };

            const billTask = {
                id: billTaskId,
                ...task,
                type: 'bill',
                status: 'queued',
                retries: 0,
                createdAt: new Date().toISOString(),
                parentTaskId: taskId
            };

            this.labelQueue.push(labelTask);
            this.billQueue.push(billTask);

            this.notifyListeners('taskAdded', { ...labelTask, queueType: 'label' });
            this.notifyListeners('taskAdded', { ...billTask, queueType: 'bill' });

            // Start both processing (lock mechanism ensures only one runs at a time for each)
            this.processLabelQueue();
            this.processBillQueue();

            return { labelTaskId, billTaskId, parentTaskId: taskId };
        } else {
            throw new Error(`Unknown print task type: ${task.type}`);
        }

        return taskId;
    }

    // Process the label queue with proper locking to prevent race conditions
    async processLabelQueue() {
        // If already processing (lock exists), wait for it to complete then return
        if (this.labelLock) {
            await this.labelLock;
            return;
        }

        // Check if there's work to do
        if (this.labelQueue.length === 0) {
            return;
        }

        // Acquire lock by creating a promise that will be resolved when processing completes
        let releaseLock;
        this.labelLock = new Promise(resolve => {
            releaseLock = resolve;
        });

        try {
            this.notifyListeners('processingStarted', { queueType: 'label' });

            while (this.labelQueue.length > 0) {
                const task = this.labelQueue[0];

                try {
                    await this.processTask(task);
                    // Remove successful task from queue
                    this.labelQueue.shift();
                    this.notifyListeners('taskCompleted', { ...task, queueType: 'label' });
                } catch (error) {
                    console.error('Label print task failed:', error);

                    // Handle retry logic
                    task.retries += 1;
                    task.lastError = error.message;
                    task.status = 'retrying';

                    if (task.retries >= this.maxRetries) {
                        // Max retries reached, remove from queue and mark as failed
                        task.status = 'failed';
                        task.failedAt = new Date().toISOString();
                        this.labelQueue.shift();

                        // Add to failed tasks list
                        this.failedTasks.push({ ...task, queueType: 'label' });
                        await this.saveFailedTasks();

                        // Notify listeners with dialog flag
                        this.notifyListeners('taskFailed', {
                            ...task,
                            queueType: 'label',
                            showDialog: true,
                            totalFailed: this.failedTasks.length
                        });
                    } else {
                        // Retry after delay
                        this.notifyListeners('taskRetrying', { ...task, queueType: 'label' });
                        await this.delay(this.retryDelay);
                    }
                }
            }

            this.notifyListeners('processingCompleted', { queueType: 'label' });
        } finally {
            // Always release lock, even if an error occurred
            this.labelLock = null;
            releaseLock();
        }
    }

    // Process the bill queue with proper locking to prevent race conditions
    async processBillQueue() {
        // If already processing (lock exists), wait for it to complete then return
        if (this.billLock) {
            await this.billLock;
            return;
        }

        // Check if there's work to do
        if (this.billQueue.length === 0) {
            return;
        }

        // Acquire lock by creating a promise that will be resolved when processing completes
        let releaseLock;
        this.billLock = new Promise(resolve => {
            releaseLock = resolve;
        });

        try {
            this.notifyListeners('processingStarted', { queueType: 'bill' });

            while (this.billQueue.length > 0) {
                const task = this.billQueue[0];

                try {
                    await this.processTask(task);
                    // Remove successful task from queue
                    this.billQueue.shift();
                    this.notifyListeners('taskCompleted', { ...task, queueType: 'bill' });
                } catch (error) {
                    console.error('Bill print task failed:', error);

                    // Handle retry logic
                    task.retries += 1;
                    task.lastError = error.message;
                    task.status = 'retrying';

                    if (task.retries >= this.maxRetries) {
                        // Max retries reached, remove from queue and mark as failed
                        task.status = 'failed';
                        task.failedAt = new Date().toISOString();
                        this.billQueue.shift();

                        // Add to failed tasks list
                        this.failedTasks.push({ ...task, queueType: 'bill' });
                        await this.saveFailedTasks();

                        // Notify listeners with dialog flag
                        this.notifyListeners('taskFailed', {
                            ...task,
                            queueType: 'bill',
                            showDialog: true,
                            totalFailed: this.failedTasks.length
                        });
                    } else {
                        // Retry after delay
                        this.notifyListeners('taskRetrying', { ...task, queueType: 'bill' });
                        await this.delay(this.retryDelay);
                    }
                }
            }

            this.notifyListeners('processingCompleted', { queueType: 'bill' });
        } finally {
            // Always release lock, even if an error occurred
            this.billLock = null;
            releaseLock();
        }
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
            default:
                throw new Error(`Unknown print task type: ${task.type}`);
        }

        task.status = 'completed';
        task.completedAt = new Date().toISOString();
    }

    // Print label using image data from Main component
    async printLabel(task) {
        const { order, printerInfo, metadata } = task;

        console.log(`PrintQueue: printLabel called with metadata:`, metadata);

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

            console.log(`PrintQueue: Built options for handleCaptureSnapshot:`, options);

            // Request label snapshot from Main component with proper options
            const uri = await this.captureCallback('label', order, options);

            if (!uri) {
                throw new Error('Failed to capture label snapshot');
            }

            // Print using the printing service
            await printingService.printLabel(uri, printerInfo);

            // Save print record with metadata
            await this.savePrintRecord(order, 'label', true, null, metadata);
            // Update print status using consistent order identifier
            const orderIdentifier = getOrderIdentifierForPrinting(order, true); // true for offline orders
            await AsyncStorage.setPrintedLabels(orderIdentifier);
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
            const base64 = await this.captureCallback('bill', order, {});

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

    // Get queue status for both queues
    getQueueStatus() {
        const labelTasks = this.labelQueue.map(task => ({
            id: task.id,
            type: task.type,
            status: task.status,
            retries: task.retries,
            createdAt: task.createdAt,
            queueType: 'label'
        }));

        const billTasks = this.billQueue.map(task => ({
            id: task.id,
            type: task.type,
            status: task.status,
            retries: task.retries,
            createdAt: task.createdAt,
            queueType: 'bill'
        }));

        return {
            label: {
                isProcessing: this.labelLock !== null,
                queueLength: this.labelQueue.length,
                tasks: labelTasks
            },
            bill: {
                isProcessing: this.billLock !== null,
                queueLength: this.billQueue.length,
                tasks: billTasks
            },
            // Combined view for backward compatibility
            combined: {
                isProcessing: this.labelLock !== null || this.billLock !== null,
                queueLength: this.labelQueue.length + this.billQueue.length,
                tasks: [...labelTasks, ...billTasks]
            }
        };
    }

    // Get all failed tasks
    getFailedTasks() {
        return this.failedTasks.map(task => ({
            id: task.id,
            type: task.type,
            queueType: task.queueType,
            status: task.status,
            retries: task.retries,
            lastError: task.lastError,
            createdAt: task.createdAt,
            failedAt: task.failedAt,
            orderInfo: {
                session: task.order?.session,
                displayID: task.order?.displayID,
                total_amount: task.order?.total_amount,
                shopTableName: task.order?.shopTableName
            },
            metadata: task.metadata
        }));
    }

    // Retry a specific failed task
    async retryFailedTask(taskId) {
        const taskIndex = this.failedTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Failed task not found');
        }

        const failedTask = this.failedTasks[taskIndex];

        // Reset task for retry
        const retryTask = {
            ...failedTask,
            status: 'queued',
            retries: 0,
            lastError: null,
            failedAt: null
        };

        // Remove from failed tasks
        this.failedTasks.splice(taskIndex, 1);
        await this.saveFailedTasks();

        // Add back to appropriate queue
        if (retryTask.queueType === 'label') {
            this.labelQueue.push(retryTask);
            this.notifyListeners('taskAdded', { ...retryTask, queueType: 'label' });
            this.processLabelQueue();
        } else {
            this.billQueue.push(retryTask);
            this.notifyListeners('taskAdded', { ...retryTask, queueType: 'bill' });
            this.processBillQueue();
        }

        return taskId;
    }

    // Retry all failed tasks
    async retryAllFailedTasks() {
        if (this.failedTasks.length === 0) {
            return { retriedCount: 0 };
        }

        const tasksToRetry = [...this.failedTasks];
        const retriedIds = [];

        for (const failedTask of tasksToRetry) {
            try {
                await this.retryFailedTask(failedTask.id);
                retriedIds.push(failedTask.id);
            } catch (error) {
                console.error(`Error retrying task ${failedTask.id}:`, error);
            }
        }

        this.notifyListeners('failedTasksRetried', {
            retriedCount: retriedIds.length,
            retriedIds
        });

        return { retriedCount: retriedIds.length, retriedIds };
    }

    // Clear failed tasks from storage
    async clearFailedTasks() {
        const clearedCount = this.failedTasks.length;
        this.failedTasks = [];
        await this.saveFailedTasks();

        if (clearedCount > 0) {
            this.notifyListeners('failedTasksCleared', {
                removed: clearedCount
            });
        }

        return { clearedCount };
    }

    // Clear specific failed task
    async clearFailedTask(taskId) {
        const taskIndex = this.failedTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            return false;
        }

        this.failedTasks.splice(taskIndex, 1);
        await this.saveFailedTasks();

        this.notifyListeners('failedTaskCleared', { taskId });
        return true;
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
