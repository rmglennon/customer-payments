$(document).ready(function () {



    // when the add note button is clicked on the saved articles page, show a modal. Empty the contents first.
    $("#stats-btn").on("click", function (event) {

        $.ajax("/api/customers", {
            type: "GET"
        }).then(
            function (data) {
                console.log("it worked");
                console.log(data);
            }
        );
    })
})