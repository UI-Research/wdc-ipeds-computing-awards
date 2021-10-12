(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        // Schema for magnitude and place data
        var best_seller_book_cols = [{
            id: "rank",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "publisher",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "title",
            alias: "title",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "description",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "author",
            dataType: tableau.dataTypeEnum.string
        }];

        var bestSellerTable = {
            id: "bookPlace",
            alias: "Best Seller Books based on a certain category",
            columns: best_seller_book_cols
        };

        // Schema for time and URL data
        var cover_amazon_url_cols = [{
            id: "rank",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "book_image",
            alias: "cover",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "amazon_product_url",
            alias: "link",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "rank_last_week",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "weeks_on_list",
            dataType: tableau.dataTypeEnum.int
        }];

        var coverAmazonTable = {
            id: "coverAmazon",
            alias: "Book Cover and Amazon URL Data",
            columns: cover_amazon_url_cols
        };
        schemaCallback([bestSellerTable, coverAmazonTable]);
    };
    
    // Download the data
    myConnector.getData = function(table, doneCallback) {
        var dateObj = JSON.parse(tableau.connectionData),
            dateString = dateObj.startDate,
            bestSeller = dateObj.lists,
            apiCall = `https://api.nytimes.com/svc/books/v3/lists/${dateString}/${bestSeller}.json?api-key=htS5OI77cFeocyNbS7qkgcqmGhBRziws`;
            console.log(apiCall);
        $.getJSON(apiCall, function(resp) {
            var feat = resp.results.books,
                tableData = [];

            var i = 0;

            if (table.tableInfo.id == "bookPlace") {
                for (i = 0, len = feat.length; i < len; i++) {
                    tableData.push({
                        "rank": feat[i].rank,
                        "publisher": feat[i].publisher,
                        "title": feat[i].title,
                        "description": feat[i].description,
                        "author": feat[i].author
                    });
                }
            }

            if (table.tableInfo.id == "coverAmazon") {
                for (i = 0, len = feat.length; i < len; i++) {
                    tableData.push({
                        "rank": feat[i].rank,
                        "book_image": feat[i].book_image,
                        "amazon_product_url": feat[i].amazon_product_url,
                        "rank_last_week": feat[i].rank_last_week,
                        "weeks_on_list": feat[i].weeks_on_list,
                    });
                }
            }

            table.appendRows(tableData);
            doneCallback();
        });
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            var dateObj = {
                startDate: $('#start-date-one').val().trim(),
                lists: $('#lists').val().trim(),
            };

            // Simple date validation: Call the getDate function on the date object created
            function isValidDate(dateStr) {
                var d = new Date(dateStr);
                return !isNaN(d.getDate());
            }

            if (isValidDate(dateObj.startDate)) {
                tableau.connectionData = JSON.stringify(dateObj); // Use this variable to pass data to your getSchema and getData functions
                tableau.connectionName = "NY Times Best Seller Feed"; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
            } else {
                $('#errorMsg').html("Enter valid dates. For example, 2016-05-08.");
            }
        });
    });
})();
