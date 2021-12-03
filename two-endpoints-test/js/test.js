(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {

       //MM - code for standard connection - we need to decide which columns to join on
            var standardConnection = {
            "alias": "Joined awards data",
            "tables": [{
                "id": "completions",
                "alias": "Institution Completions"
            }, {
                "id": "institution",
                "alias": "Institution"
            }],
            "joins": [{
                "left": {
                    "tableAlias": "Institution Completions",
                    "columnId": "unitid_year"
                },
                "right": {
                    "tableAlias": "Institution",
                    "columnId": "unitid_year"
                },
                "joinType": "left"
            }]
        };

        // Schema for Completion
        let completionCols = [
            {
                id: "unitid_year",
                alias: "ID-year",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "unitid",
                alias: "ID",
                dataType: tableau.dataTypeEnum.string
            }, 
            {
                id: "year",
                alias: "Year",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "fips",
                alias: "Fips",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "cipcode",
                alias: "CIP Code",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "award_level",
                alias: "Award Level",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "majornum",
                alias: "Major Number",
                dataType: tableau.dataTypeEnum.string
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
                dataType: tableau.dataTypeEnum.int
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
                id: "unitid_year",
                alias: "ID-year",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "unitid",
                alias: "ID",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "year",
                alias: "Year",
                dataType: tableau.dataTypeEnum.string
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
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "tribal_college",
                alias: "Tribal College",
                dataType: tableau.dataTypeEnum.string
            }
        ];
        
        let institutionTable = {
            id: "institution",
            alias: "Institution",
            columns: institutionCols
        };
        //schemaCallback([completionTable, institutionTable]);
        schemaCallback([completionTable, institutionTable], [standardConnection]);
    };
    console.log('testing-v1');
    // Download the data
    myConnector.getData = async function(table, doneCallback){
        var dateObj = JSON.parse(tableau.connectionData);
        var dateString = dateObj.yearRequested[0];
        console.log(`date string: ${dateString}`);
        var yearMax = dateObj.yearRequested.length;
        console.log(`Year Length: ${yearMax}`);
        var fip = dateObj.fipRequested;
        console.log(`dateString: ${dateString}`);
        
        console.log(`fip: ${fip}`);
        
        // Branch logic based on the table ID
        switch(table.tableInfo.id) {
            case 'completions':
                var moreYears = true;
                var yearCount = 0;
                var morePages = true;
                var page = 1;
                var tableData = [];
                
                //while (moreYears) {
                while (morePages && moreYears) {
                    console.log('testing-v6');
    
                    //Manually handle asynchronicity
                    
                    apiCall = `https://educationdata.urban.org/api/v1/college-university/ipeds/completions-cip-2/${dateString}/?fips=${fip}&cipcode=110000&page=${page}`;
                    console.log(`api${page}: ${apiCall}`);
                    
                    var data = await fetch(apiCall).then(response => response.json());

                    var nextPage = data.next;
                    
                    var feat = data.results;
                        //tableData = [];
                    var i = 0;
                    // Iterate over the JSON object
                    if (table.tableInfo.id == "completions") {
                        if (feat.length > 0){
                            for (var i = 0, len = feat.length; i < len; i++) {
                                
                                tableData.push({
                                "unitid_year": (feat[i].unitid).toString() + '-' + (feat[i].year).toString(),
                                "unitid": feat[i].unitid,
                                "year": feat[i].year,
                                "fips": feat[i].fips,
                                "cipcode": feat[i].cipcode,
                                "award_level": feat[i].award_level,
                                "majornum": feat[i].majornum,
                                "sex": feat[i].sex,
                                "race": feat[i].race,
                                "awards": feat[i].awards,
                                });
                                
                            }
                            if(nextPage == null) { //Check if we reach the page limit for the current page


                                page = 1;
                                yearCount++;
                                console.log(`Pagee Counter: ${page}`);
                                console.log(`Yearr Counter: ${yearCount}`);
                                dateString = dateObj.yearRequested[yearCount]
                                //dateString++;
                                console.log(`Nextt year: ${dateString}`);

                                if(dateString==undefined){
                                    console.log("Finished loading all years")
                                    moreYears=false;
                                }
                            }/*else if(dateString == undefined || dateString == null){
                                console.log('Break-User chose only one year');
                                moreYears = false;
                                break;
                            }*/
                            else{
                                page++;
                            }
                            /*if(yearCount >= 3){
                                console.log('Break-1');
                                moreYears = false;
                                break;
                                
                            }*/
                        } else{
                            morePages = false;
                        }
                        
                    }

                };
                table.appendRows(tableData);
                doneCallback();
                console.log('table-1-done-rendering');
                //};
                break;

            case 'institution':
                var moreYears = true;
                var yearCount = 0;
                var morePages = true;
                var page = 1;
                tableData = [];

                while(morePages && moreYears){
                    apiCall = `https://educationdata.urban.org/api/v1/college-university/ipeds/directory/${dateString}/?fips=${fip}&cipcode=110000&page=${page}`;
                    console.log(`api${page}: ${apiCall}`);
                    var data = await fetch(apiCall).then(response => response.json());

                    var nextPage = data.next;

                    var feat = data.results;
                        //tableData = [];
                        
                    var i = 0;

                    // Iterate over the JSON object
                    if (table.tableInfo.id == "institution") {
                        if(feat.length > 0){
                            for (var i = 0, len = feat.length; i < len; i++) {
                                tableData.push({
                                "unitid_year": (feat[i].unitid).toString() + '-' + (feat[i].year).toString(),
                                "unitid": feat[i].unitid,
                                "year": dateString,
                                "inst_name": feat[i].inst_name,
                                "address": feat[i].address,
                                "region": feat[i].region,
                                "inst_control": feat[i].inst_control,
                                "hbcu": feat[i].hbcu,
                                "tribal_college": feat[i].tribal_college,
                                });
                            }
                            if(nextPage == null) { //Check if we reach the page limit for the current page
                                page = 1;
                                yearCount++;
                                console.log(`Pagee Counter: ${page}`);
                                console.log(`Yearr Counter: ${yearCount}`);
                                dateString = dateObj.yearRequested[yearCount];
                                console.log(`Nextt year: ${dateString}`);

                                if(dateString==undefined){
                                    console.log("Finished loading all years")
                                    moreYears=false;
                                }
                            }
                            else{
                                page++;
                            }
                            /*if(yearCount >= 3){
                                console.log('Break-2');
                                moreYears = false;
                                break;
                                
                            }*/
                        } 
                        else {
                            morePages = false;
                        }
                    }

                };
                table.appendRows(tableData);
                doneCallback();
                console.log('table-2-done-rendering');
                break;
        };
    };

    tableau.registerConnector(myConnector);
    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $('#submitButton').prop("disabled", true);

        $('select').change(function(){
            //var selected_option = $(this).find(":selected").val();
            var years = $('#choose').val();
            var state = $('#state-fip').val();
            console.log(`selected-years: ${years}`);
            console.log(`selected-state: ${state}`);
            //console.log(`selected: ${selected_option}`);
            if (state !="" & years !="") {
                //console.log($('#choose').val().length);
                //$('.rules').hide();
                $('#submitButton').prop("disabled", false);
            }
          });
        
        $("#submitButton").click(function() {
            var dateObj = {
                yearRequested: $('#choose').val(),
                fipRequested:  $('#state-fip').val().trim(),
            };
            if (dateObj.yearRequested) {
                tableau.connectionData = JSON.stringify(dateObj); // Use this variable to pass data to your getSchema and getData functions
                tableau.connectionName = "Test feed from two different endpoints"; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
            } else {
                $('#errorMsg').html("Enter a valid year. For example, 2018.");
            }
            console.log('testing-v6');
        });
    });
})();