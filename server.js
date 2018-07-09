// add required packages
require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");

var PORT = process.env.PORT || 3000;

// initialize Express
var app = express();

// use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json({
    type: "application/json"
}));

// serve the public directory
app.use(express.static("public"));

// use Stripe package
var stripe = require("stripe")(
    process.env.API_KEY
);

// use charges API to get a list of all the charges in the account 
// dashboard shows about 900, though there is a limit of 100 per request
// node.js does not have auto-pagination, so getting all data involves chaining functions

var allCharges = [];
var flattenedAllCharges = [];

// app.get("/api/customers", function (req, res) {
//     paginateCharges(null)
//         .done(function (endResult) {
//             console.log("i ran")
//             res.json(endResult);
//         })
// })

function paginateCharges(last_id) {
    // Define request parameters
    var req_params = { limit: 100 };
    if (last_id !== null) { req_params['starting_after'] = last_id; }

    // Get a list of all charges and put them in an array
    stripe.charges.list(
        req_params,
        function (err, charges) {
            console.log("Getting charges data from the Stripe API");

            allCharges.push(charges.data);

            // If has_more is true, then there are additional results
            if (charges.has_more) {
                paginateCharges(charges["data"][charges["data"].length - 1].id);
            }
            else {
                console.log("api work done");
                getCustomerTotal(allCharges);
            }
            // getCustomerTotal(allCharges);
        })
}


function getCustomerTotal(charges) {

    // flatten array of arrays    
    var flattenedAllCharges = [].concat(...allCharges);

    var result = [];

    // use reduce to find repeat customers and sum the amount of their charges, and a count of number of charges
    // some examples of this use at https://medium.freecodecamp.org/reduce-f47a7da511a9    
    flattenedAllCharges.reduce(function (res, value) {

        // if there is not a current customer, then create it at 0 and add it to the array
        if (!res[value.customer]) {
            res[value.customer] = {
                customer: value.customer,
                amount: 0,
                charges: 0
            };
            result.push(res[value.customer])
        }
        // tally the customer's amount and count of individual charges
        res[value.customer].amount += value.amount;
        res[value.customer].charges++;
        return res;
    }, {});

    // send new array over to function to sort it by the highest count
    sortByTotal(result);
}

// sort the array by the top charge amounts
function sortByTotal(arr) {
    arr.sort(function (a, b) {
        return b.amount - a.amount;
    })

    // print the array and the length (which represents unique customers)
    console.log("Top 20 customers are: \n", arr.slice(0, 10));
    console.log("Number of unique customers: ", arr.length);
}

paginateCharges(null);

// listen for the routes
app.listen(PORT, function () {
    console.log("App is running");
});