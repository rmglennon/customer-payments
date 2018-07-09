// add required packages
require("dotenv").config();

// packages for console formatting
var Table = require('cli-table3');
var numeral = require("numeral");

// use Stripe package
var stripe = require("stripe")(
    process.env.API_KEY
);

// use charges API to get a list of all the charges in the account 
// dashboard shows about 900, though there is a limit of 100 per request
// node.js does not have auto-pagination, so getting all data involves chaining functions
// to test on a smaller set of data (returned by most recent charge), set req_params {limit: } and skip if/else

var allCharges = [];
var flattenedAllCharges = [];

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
                console.log("The API is work done");
                getCustomerTotal(allCharges);
            }
            // only if you skip if/else
            // getCustomerTotal(allCharges);
        })
}


function getCustomerTotal(charges) {

    // flatten array of arrays    
    var flattenedAllCharges = [].concat(...allCharges);
    console.log("*********************");
    console.log("Number of total charges: ", flattenedAllCharges.length);
    var result = [];

    // use reduce to find repeat customers and sum the amount of their charges, and a count of number of charges
    // some examples of this use at https://medium.freecodecamp.org/reduce-f47a7da511a9    
    flattenedAllCharges.reduce(function (res, value) {

        // if there is not a current customer, then create it at 0 and add it to the array
        // if desired, you could capture other parts of the charges object for display and analysis
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
   // console.log("Top 10 customers are: \n", arr.slice(0, 10));
    console.log("Number of unique customers: ", arr.length);
    console.log("*********************");

    // set up the table headings and widths
    var table = new Table({
        head: ["Customer", "Total charges", "Total amount"]
        , colWidths: [30, 15, 15]
    });

    // use table package to build a table for each item in the input array
    // limit to top 10 customers
    for (var i = 0; i < 10; i++) {
        table.push(
            [arr[i].customer, arr[i].charges, numeral(arr[i].amount).format("$0,0.00")]
        );
    }

    // print the table to the console
    console.log(table.toString());
}

// kick off functions
paginateCharges(null);