(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        var cols = [{
            id: "school_id",
            alias: "id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "year",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "school_name",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "street_location",
            dataType: tableau.dataTypeEnum.geometry
        }, {
            id: "city_location",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "zip_location",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "state_location",
            alias: "state",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "phone",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "school_level",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "school_status",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "free_lunch",
            dataType: tableau.dataTypeEnum.string
        }];
        
        var tableSchema = {
            id: "educationFeed",
            alias: "Enrollemnt for grade 3 in 2014",
            columns: cols
        };
    
        schemaCallback([tableSchema]);
    };

    myConnector.getData = function(table, doneCallback) {
        $.getJSON("https://educationdata.urban.org/api/v1/schools/ccd/directory/2014/", function(resp) {
            var feat = resp.results,
                tableData = [];
    
            // Iterate over the JSON object
            for (var i = 0, len = feat.length; i < len; i++) {
                tableData.push({
                    "school_id": feat[i].leaid,
                    "year": feat[i].year,
                    "school_name": feat[i].school_name,
                    "street_location": feat[i].street_location,
                    "city_location": feat[i].city_location,
                    "zip_location": feat[i].zip_location,
                    "state_location": feat[i].state_location,
                    "phone": feat[i].phone,
                    "school_level": feat[i].school_level,
                    "school_status": feat[i].school_status,
                    "free_lunch": feat[i].free_lunch,
                });
            }
    
            table.appendRows(tableData);
            doneCallback();
        });
    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "USGS Education Feed";
            tableau.submit();
        });
    });
})();