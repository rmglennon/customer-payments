// add required packages
require("dotenv").config();

// use Stripe package
var stripe = require("stripe")(
    process.env.API_KEY
);

// use charges API to get a list of all the charges in the account 
// dashboard shows about 900, though there is a limit of 100 per request
// node.js does not have auto-pagination, so getting all data involves chaining functions

function paginateCharges(last_id) {
    // Define request parameters
    var req_params = { limit: 5 };
    if (last_id !== null) { req_params['starting_after'] = last_id; }

    var allCharges = [];
    var flattenedAllCharges = [];

    // Get events
    stripe.charges.list(
        req_params,
        function (err, charges) {

            // console.log(charges.data);

            allCharges.push(charges.data);

            // Check for more
            // if (charges.has_more) {
            //     paginateCharges(charges["data"][charges["data"].length - 1].id);
            // }

            flattenedAllCharges = [].concat(...allCharges);
            getCustomerTotal(flattenedAllCharges);

        })
}


function getCustomerTotal(charges) {

    charges.forEach(function (element) {
        console.log(element.customer);
        console.log(element.amount);

        // totalAmount += totalAmount;
        // console.log(totalAmount) 
    });

}

paginateCharges(null);