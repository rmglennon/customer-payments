// add required packages
var express = require("express");
var bodyParser = require("body-parser");
require("dotenv").config();

var app = express();
var PORT = process.env.PORT || 3000;

// use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json({
    type: "application/json"
}));

// serve the public directory
app.use(express.static("public"));

var stripe = require("stripe")(
    process.env.API_KEY
);


// stripe.customers.list(
//     { limit: 3 },
//     function (err, customers) {
//         console.log(customers);
//     }
// )

// var pagination = {
//     starting_after: "last_object"
// }

// starting_after: "txn_1CFSYQFvtr76Pd3rAYeXzz2b",

// stripe.balance.listTransactions({ type: "charge", limit: 6 }, function(err, transactions) {
//    // console.log(transactions);
//     console.log(data.has_more);
//   });

stripe.charges.list({ limit: 30 }, function (err, charges) {

    var chargeAmount = [];
    // loop through the charges returned and push them into an array of objects with the customer and amount
    for (i = 0; i < charges.data.length; i++) {
        chargeAmount.push({ customer: charges.data[i].customer, amount: charges.data[i].amount })

    }
    //console.log(chargeAmount);
    //   if (charges.has_more) {
    //     // paginateCharges(charges["data"][charges["data"].length - 1].id);
    //   }

    chargeAmount.sort(function(a, b) {
        return b.amount - a.amount;
    })

    console.log(chargeAmount);


});

function paginateCharges(starting_after) {
    stripe.charges.list(
        { limit: 100, starting_after: starting_after },
        function (err, charges) {
            for (i = 0; i < charges.data.length; i++) {
                console.log(charges.data[i].id);
            }
            if (charges.has_more) {
                paginateCharges(charges["data"][charges["data"].length - 1].id);
            }
        }
    )
}

// start server listener
app.listen(PORT, function () {
    console.log("App listening on PORT: " + PORT);
});