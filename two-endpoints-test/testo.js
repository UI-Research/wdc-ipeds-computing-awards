(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        // Schema for Completion
        let completionCols = [
            {
                id: "unitid",
                alias: "ID",
                dataType: tableau.dataTypeEnum.int
            }, 
            {
                id: "year",
                alias: "Year",
                dataType: tableau.dataTypeEnum.int
            },
            {
                id: "fips",
                alias: "Fips",
                dataType: tableau.dataTypeEnum.int
            },
            {
                id: "cipcode",
                alias: "CIP Code",
                dataType: tableau.dataTypeEnum.int
            },
            {
                id: "award_level",
                alias: "Award Level",
                dataType: tableau.dataTypeEnum.int
            },
            {
                id: "majornum",
                alias: "Major Number",
                dataType: tableau.dataTypeEnum.int
            },
            {
                id: "sex",
                alias: "Sex",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "race",
                alias: "Race",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "awards",
                alias: "Awards",
                dataType: tableau.dataTypeEnum.string
            }
        ];

        let completionTable = {
            id: "completions",
            alias: "Institution Completions",
            columns: completionCols
        };

        // Schema for Institution/College
        let institutionCols = [
            {
                id: "unitid",
                alias: "ID",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "inst_name",
                alias: "Institution Name",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "address",
                alias: "Address",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "region",
                alias: "Region",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "inst_control",
                alias: "Intitution Control",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "hbcu",
                alias: "HBCU",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "tribal_college",
                alias: "Tribal College",
                dataType: tableau.dataTypeEnum.int,
            }
        ];
        
        let institutionTable = {
            id: "institution",
            alias: "Institution",
            columns: institutionCols
        };
        schemaCallback([completionTable, institutionTable]);
    };

        //Download the data
        myConnector.getData = async function(table, doneCallback){
            let tableData = [];
            if(table.tableInfo.id === 'completions')
        }
})();