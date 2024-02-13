const { Apriori } = require('node-apriori');
const fs = require('fs');
const csvParser = require('csv-parser');

// Read the CSV file and parse the data
const transactions = [];
fs.createReadStream('public/BigBasket.csv')
    .pipe(csvParser())
    .on('data', (row) => {
        // Convert the row into a transaction
        const transaction = [row.ProductName, row.Brand, row.Price, row.DiscountPrice, row.Image_Url, row.Quantity, row.Category, row.SubCategory, row.Absolute_Url];
        transactions.push(transaction);
    })
    .on('end', () => {
        // Execute Apriori with a minimum support of 40%
        const apriori = new Apriori(0.4);

        // Returns frequent itemsets 'as soon as possible' through events
        apriori.on('data', (itemset) => {
            // Do something with the frequent itemset
            const support = itemset.support;
            const items = itemset.items;
            console.log(`Frequent Itemset: ${items}, Support: ${support}`);
        });

        // Execute Apriori on the given set of transactions
        apriori.exec(transactions)
            .then((result) => {
                // Returns both the collection of frequent itemsets and execution time in milliseconds
                const frequentItemsets = result.itemsets;
                const executionTime = result.executionTime;
                console.log('Frequent Itemsets:');
                console.log(frequentItemsets);
                console.log(`Execution Time: ${executionTime} ms`);
            })
            .catch((error) => {
                console.error('Error executing Apriori:', error);
            });
    });