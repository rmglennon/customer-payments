// add required packages
require("dotenv").config();
var Table = require('cli-table3');
var numeral = require("numeral");
var express = require("express");
var PORT = process.env.PORT || 3000;
var app = express();

// use Stripe package
var stripe = require("stripe")(
    process.env.API_KEY
);

// use charges API to get a list of all the charges in the account 
// dashboard shows about 900, though there is a limit of 100 per request
// node.js does not have auto-pagination, so getting all data involves chaining functions

var chargeAmount = [];

stripe.charges.list({ limit: 100}, function (err, charges) {
    console.log("running charges API function 1");

    chargeAmount.push(charges);
    // loop through the charges returned and push them into an array of objects with the customer and amount
    // for (i = 0; i < charges.data.length; i++) {
    //     chargeAmount.push(charges);
    //    // chargeAmount.push({ customer: charges.data[i].customer, description: charges.data[i].description, amount: charges.data[i].amount })
    //   //  console.log(chargeAmount[i]);
    // }

   // printTopCustomers(chargeAmount);
    //if has_more: true, then go to the next function and make additional requests    
    if (charges.has_more) {
        paginateCharges(charges["data"][charges["data"].length - 1].id);
    }

  //  getCustomerTotal(chargeAmount);

});

// function to grab the next set of charges if there are more than the limit (100) of the first pagination
function paginateCharges(starting_after) {
    stripe.charges.list(
        { limit: 100, starting_after: starting_after },
        function (err, charges) {
            console.log("running charges API function 2");

            // for (i = 0; i < charges.data.length; i++) {
            //     chargeAmount.push(charges.data);
            //   //  chargeAmount.push({ customer: charges.data[i].customer, description: charges.data[i].description, amount: charges.data[i].amount })
            // }

            chargeAmount.push(charges);

            if (charges.has_more) {
                paginateCharges(charges["data"][charges["data"].length - 1].id);
            }

            // if has_more is false, sort through all the elements in the array by the amount
            else {
            //     chargeAmount.sort(function (a, b) {
            //         return b.data.amount - a.data.amount;
            //     })

                // when there are no more records, output the results
                console.log("API requests completed \n \n");
               getCustomerTotal(chargeAmount);
            }
        }
    )
}

function getCustomerTotal(chargeAmount) {
    var totalByCustomer = [];
// console.log("*********************************", chargeAmount[0].data[0].amount);
    
   // var everything = [].concat.apply([], chargeAmount);

 //  var everything = [].concat.apply([], chargeAmount);

// console.log("length of chargeamount ", chargeAmount.length)
//     var chargeAmountData = everything[0].data;
// //   console.log(chargeAmountData)
//    chargeAmountData.forEach(individualCharge => {
//     //   // console.log(individualCharge);
//      console.log(individualCharge.amount);

//     })

for (var i = 0; i < chargeAmount.length; i++) {
  //  console.log(chargeAmount[1].data[i].amount)
    for (var j = 0; j < 20; j++) {
        console.log(`i loop ${i} in j loop ${j}`);
        console.log(chargeAmount[i].data[j].amount)
    }
}

//console.log(everything.length);
}

// makes a table of top 20 customers in the console from all the charges
function printTopCustomers(allCharges) {
    console.log("\n These are the top charges by amount. \n");

    // set up the table headings and widths
    var table = new Table({
        head: ["Customer", "Description", "Amount"]
        , colWidths: [30, 40, 20]
    });

    // use table package to build a table for each item in the input array
    for (var i = 0; i < 20; i++) {
        table.push(
            [allCharges[i].customer, allCharges[i].description, numeral(allCharges[i].amount).format("$0,0.00")]
        );
    }

    // print the table to the console
    console.log(table.toString());
}

// TODO: function to get email address by searching for a customer ID
function retrieveCustomer(customerId) {
    stripe.customers.retrieve(
        customerId,
        function (err, customer) {
            console.log(customer.email)
        }
    );
}

// start server listener
app.listen(PORT, function () {
    console.log("App listening on PORT: " + PORT);
});