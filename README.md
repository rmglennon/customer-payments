# Find your top customers

This is a Node.js console app to identify your top customers from [Stripe](https://stripe.com/). It uses the Stripe `charges` method to return a list of previous charges in your account. 

The results are sorted based on the customers with the highest charges by dollar amount, and then are displayed as a table with customer IDs, the total number of the customer's charges, and the total amount they have charged.

More information on the API: https://stripe.com/docs/api/node#list_charges

## Set up and installation

These must be installed to access the app:

- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/get-npm)

You need sign up for a Stripe account and get an API key at https://dashboard.stripe.com/. If you need to populate data in your account, you [enable test data](https://stripe.com/docs/dashboard#navigation).

Clone or download this repository, and then create a `.env` file containing the entry `API_KEY=` with your API key from your dashboard. This way, your secret key can remain protected from public view.

## Run the app

To run the app, open a terminal window to the folder, install the required npm packages, and type `node server.js`. 

Note: The Stripe API uses cursor-based [pagination](https://stripe.com/docs/api/node#pagination). Because the Stripe Node library does not currently support auto-pagination, this code uses recursive functions that make multiple requests to get additional results. It may take some time to work through the results. If you find it has gone too long, modify the limits and skip the if/else statements.

The results display the number of total charges, unique customers, and a summary table.  

![Results of API and sorting](/images/table-result.png)

With this information, you could use the customer IDs and feed them into the [customers API](https://stripe.com/docs/api/node#customers) to get additional information about the customer.

## Technology

- JavaScript
- Node.js
- npm, including [stripe](https://www.npmjs.com/package/stripe), [cli-table3](https://www.npmjs.com/package/cli-table3), and [numeral](https://www.npmjs.com/package/numeral) packages