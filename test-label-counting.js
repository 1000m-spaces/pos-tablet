// Test file to verify the label counting logic
// This simulates the fixed counting logic from OfflineOrderTable.js

function testLabelCounting() {
    // Example order with multiple products and quantities
    const originalOrder = {
        session: "TEST-001",
        products: [
            { name: "Coffee", quanlity: 2, price: 25000 },     // 2 labels
            { name: "Sandwich", quanlity: 3, price: 35000 },   // 3 labels  
            { name: "Tea", quanlity: 1, price: 15000 },        // 1 label
            { name: "Cake", quanlity: 2, price: 45000 }        // 2 labels
        ]
    };

    // Calculate total number of labels to be printed (same logic as in the fixed code)
    let totalLabels = 0;
    if (originalOrder.products) {
        originalOrder.products.forEach(product => {
            // For offline orders, each product gets one label per quantity
            totalLabels += (product.quanlity || 1);
        });
    }

    console.log(`Total labels to print: ${totalLabels}`); // Should be 8

    let currentLabelIndex = 0;
    const labelResults = [];

    // Print each product separately (same logic as in the fixed code)
    if (originalOrder.products) {
        for (let i = 0; i < originalOrder.products.length; i++) {
            const product = originalOrder.products[i];
            const quantity = product.quanlity || 1;

            console.log(`\nProduct: ${product.name} (Quantity: ${quantity})`);

            // Print one label for each quantity of the product
            for (let q = 0; q < quantity; q++) {
                // Using 1-based indexing for display (fixed logic)
                const itemIdx = currentLabelIndex + 1;

                labelResults.push({
                    productName: product.name,
                    labelNumber: itemIdx,
                    totalLabels: totalLabels,
                    display: `Label ${itemIdx} of ${totalLabels}`,
                    currentIndex: currentLabelIndex
                });

                console.log(`  - Label ${itemIdx} of ${totalLabels} (currentLabelIndex: ${currentLabelIndex})`);

                currentLabelIndex++;
            }
        }
    }

    console.log('\n=== Summary ===');
    console.log(`Expected total: 8, Actual total: ${totalLabels}`);
    console.log(`Labels printed: ${labelResults.length}`);
    console.log(`Final currentLabelIndex: ${currentLabelIndex}`);
    console.log(`Label range: ${labelResults[0]?.labelNumber} to ${labelResults[labelResults.length - 1]?.labelNumber}`);

    // Verify the logic is correct
    const isCorrect = totalLabels === 8 &&
        labelResults.length === 8 &&
        currentLabelIndex === 8 &&
        labelResults[0].labelNumber === 1 &&
        labelResults[7].labelNumber === 8;

    console.log(`\n✅ Counting logic is ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);

    return labelResults;
}

// Run the test
testLabelCounting();
