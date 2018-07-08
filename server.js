// add required packages
require("dotenv").config();

// use Stripe package
var stripe = require("stripe")(
    process.env.API_KEY
);

// use charges API to get a list of all the charges in the account 
// dashboard shows about 900, though there is a limit of 100 per request
// node.js does not have auto-pagination, so getting all data involves chaining functions

var allCharges = [];
var flattenedAllCharges = [];

function paginateCharges(last_id) {
    // Define request parameters
    var req_params = { limit: 100 };
    if (last_id !== null) { req_params['starting_after'] = last_id; }

    // Get events
    stripe.charges.list(
        req_params,
        function (err, charges) {
            console.log("thinking");
            // console.log(charges.data);

            allCharges.push(charges.data);

            // Check for more
            if (charges.has_more) {
                paginateCharges(charges["data"][charges["data"].length - 1].id);
            }
            else {
                console.log("api work done");
                getCustomerTotal(allCharges);
            }

        })
}


function getCustomerTotal(charges) {

    var flattenedAllCharges = [].concat(...allCharges);

    var result = [];
    flattenedAllCharges.reduce(function (res, value) {
        if (!res[value.customer]) {
            res[value.customer] = {
                customer: value.customer,
                amount: 0
            };
            result.push(res[value.customer])
        }
        res[value.customer].amount += value.amount
        return res;
    }, {});
    sortByTotal(result);
 //   console.log(result)

}

function sortByTotal(arr) {
    arr.sort(function (a, b) {
        return b.amount - a.amount;
    })

    console.log(arr);
}

paginateCharges(null);