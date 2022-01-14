(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    const zeroPad = (num, places) => String(num).padStart(places, '0')

    // Define the schema
    myConnector.getSchema = async function(schemaCallback) {

        var standardConnection = {
            "alias": "Joined awards data",
            "tables": [{
                "id": "awards",
                "alias": "CIP 11 Awards"
            }, {
                "id": "institution",
                "alias": "Institution"
            }],
            "joins": [{
                "left": {
                    "tableAlias": "CIP 11 Awards",
                    "columnId": "unitid_year"
                },
                "right": {
                    "tableAlias": "Institution",
                    "columnId": "unitid_year"
                },
                "joinType": "left"
            }]
        };


        var var_description = {};
        var var_label = {};
        var variable_metadata = await fetch('https://educationdata-stg.urban.org/api/v1/api-variables/')
            .then(response => response.json());
        var variable_metadata_feat = variable_metadata.results;
        variable_metadata_feat.forEach(function (arrayItem) {
           var_description[arrayItem.variable] = arrayItem.description;
           var_label[arrayItem.variable] = arrayItem.label;
        });

        // Schema for Completion
        let completionCols = [
            {
                id: "unitid_year",
                alias: "ID-year",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "unitid",
                alias: var_label["unitid"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["unitid"]
            },
            {
                id: "year",
                alias: var_label["year"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["year"]
            },
            {
                id: "cipcode",
                alias: var_label["cipcode"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["cipcode"]
            },
            {
                id: "award_level",
                alias: var_label["award_level"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["award_level"]
            },
            {
                id: "majornum",
                alias: var_label["majornum"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["majornum"]
            },
            {
                id: "sex",
                alias: var_label["sex"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["sex"]
            },
            {
                id: "race",
                alias: var_label["race"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["race"]
            },
            {
                id: "awards",
                alias: var_label["awards"],
                dataType: tableau.dataTypeEnum.int,
                description: var_description["awards"]
            }
        ];

        let completionTable = {
            id: "awards",
            alias: "CIP 11 Awards",
            columns: completionCols
        };

        // Schema for Institution/College
        let institutionCols = [
            {
                id: "unitid_year",
                alias: "ID-year",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "unitid",
                alias: var_label["unitid"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["unitid"]
            },
            {
                id: "year",
                alias: var_label["year"],
                dataType: tableau.dataTypeEnum.date,
                description: var_description["year"]
            },
            {
                id: "inst_name",
                alias: var_label["inst_name"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["inst_name"]
            },
            {
                id: "state_abbr",
                alias: var_label["state_abbr"],
                dataType: tableau.dataTypeEnum.string,
                geoRole: tableau.geographicRoleEnum.state_province,
                description: var_description["state_abbr"]
            },
            {
                id: "zip",
                alias: var_label["zip"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["zip"]
            },
            {
                id: "county_fips",
                alias: var_label["county_fips"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["county_fips"]
            },
            {
                id: "region",
                alias: var_label["region"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["region"]
            },
            {
                id: "cbsa",
                alias: var_label["cbsa"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["cbsa"]
            },
            {
                id: "congress_district_id",
                alias: "114th congressional district identification number",
                dataType: tableau.dataTypeEnum.string,
                geoRole: tableau.geographicRoleEnum.congressional_district,
                description: var_description["congress_district_id"]
            },
            {
                id: "inst_control",
                alias: var_label["inst_control"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["inst_control"]
            },
            {
                id: "institution_level",
                alias: var_label["institution_level"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["institution_level"]
            },
            {
                id: "hbcu",
                alias: var_label["hbcu"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["hbcu"]
            },
            {
                id: "tribal_college",
                alias: var_label["tribal_college"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["tribal_college"]
            },
            {
                id: "city",
                alias: var_label["city"],
                dataType: tableau.dataTypeEnum.string,
                description: var_description["city"]
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
    // Download the data
    myConnector.getData = async function(table, doneCallback){
        var dateObj = JSON.parse(tableau.connectionData);
        var dateString = dateObj.yearRequested[0];
        //console.log(`date string: ${dateString}`);
        var yearMax = dateObj.yearRequested.length;
        //console.log(`Year Length: ${yearMax}`);
        var fip = dateObj.fipRequested;
        //console.log(`fip: ${fip}`);
        
        // Branch logic based on the table ID
        switch(table.tableInfo.id) {
            case 'awards':
                var moreYears = true;
                var yearCount = 0;
                var morePages = true;
                var page = 1;
                var tableData = [];

                // initialize label dictionary
                variable_list = ["award_level", "majornum", "sex", "race"]
                var label_dictionary = {}
                variable_list.forEach(item =>
                     label_dictionary[item] = {}
                );

                // metadata api call
                var metadata_apiCall = "https://educationdata-stg.urban.org/api/v1/api-values/";
                var metadata = await fetch(metadata_apiCall).then(response => response.json());
                var metadata_feat = metadata.results;

                // loop through metadata and add relevant values to label dictionary
                metadata_feat.forEach(function (arrayItem) {
                    if(variable_list.includes(arrayItem.format_name)){
                        label_dictionary[arrayItem.format_name][arrayItem.code] = arrayItem.code_label.split(" - ")[1]

                        if(arrayItem.format_name=="region"){
                            label_dictionary[arrayItem.format_name][arrayItem.code] = label_dictionary[arrayItem.format_name][arrayItem.code].split(":")[0]
                        };
                    };
                });
                
                //while (moreYears) {
                while (morePages && moreYears) {
                    //Manually handle asynchronicity
                    
                    apiCall = `https://educationdata.urban.org/api/v1/college-university/ipeds/completions-cip-2/${dateString}/?fips=${fip}&cipcode=110000&page=${page}`;

                    var data = await fetch(apiCall).then(response => response.json());

                    var nextPage = data.next;
                    
                    var feat = data.results;
                        //tableData = [];
                    var i = 0;
                    // Iterate over the JSON object
                    if (table.tableInfo.id == "awards") {
                        if (feat.length > 0){
                            for (var i = 0, len = feat.length; i < len; i++) {
                                
                                tableData.push({
                                "unitid_year": (feat[i].unitid).toString() + '-' + (feat[i].year).toString(),
                                "unitid": feat[i].unitid,
                                "year": feat[i].year,
                                "cipcode": feat[i].cipcode,
                                "award_level": label_dictionary["award_level"][feat[i].award_level],
                                "majornum": label_dictionary["majornum"][feat[i].majornum],
                                "sex": label_dictionary["sex"][feat[i].sex],
                                "race": label_dictionary["race"][feat[i].race],
                                "awards": feat[i].awards,
                                });
                                
                            }
                            if(nextPage == null) { //Check if we reach the page limit for the current page


                                page = 1;
                                console.log("Pulled page " + page + " for " + yearCount);
                                yearCount++;
                                dateString = dateObj.yearRequested[yearCount]

                                if(dateString==undefined){
                                    //console.log("Finished loading all years")
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
                //console.log('table-1-done-rendering');
                //};
                break;

            case 'institution':
                var moreYears = true;
                var yearCount = 0;
                var morePages = true;
                var page = 1;
                tableData = [];

                // initialize label dictionary
                variable_list = ["region","inst_control", "institution_level"]
                var label_dictionary = {}
                variable_list.forEach(item =>
                    label_dictionary[item] = {}
                );

                // metadata api call
                var metadata_apiCall = "https://educationdata-stg.urban.org/api/v1/api-values/";
                var metadata = await fetch(metadata_apiCall).then(response => response.json());
                var metadata_feat = metadata.results;

                // loop through metadata and add relevant values to label dictionary
                metadata_feat.forEach(function (arrayItem) {
                    if(variable_list.includes(arrayItem.format_name)){
                        label_dictionary[arrayItem.format_name][arrayItem.code] = arrayItem.code_label.split(" - ")[1]

                        if(arrayItem.format_name=="region"){
                            label_dictionary[arrayItem.format_name][arrayItem.code] = label_dictionary[arrayItem.format_name][arrayItem.code].split(":")[0]
                        };
                    };
                });

                while(morePages && moreYears){
                    apiCall = `https://educationdata.urban.org/api/v1/college-university/ipeds/directory/${dateString}/?fips=${fip}&cipcode=110000&page=${page}`;
                    //console.log(`api${page}: ${apiCall}`);
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
                                "year": feat[i].year,
                                "inst_name": feat[i].inst_name,
                                "state_abbr": feat[i].state_abbr,
                                "zip": (feat[i].zip).toString().substring(0,5),
                                "county_fips": zeroPad(feat[i].county_fips, 5),
                                "region": label_dictionary["region"][feat[i].region],
                                "cbsa": feat[i].cbsa,
                                "congress_district_id": Number(((feat[i].congress_district_id).toString()).slice(-2)).toString(),
                                "inst_control": label_dictionary["inst_control"][feat[i].inst_control],
                                "institution_level": label_dictionary["institution_level"][feat[i].institution_level],
                                "hbcu": feat[i].hbcu,
                                "tribal_college": feat[i].tribal_college,
                                "city": feat[i].city,
                                });
                            }
                            if(nextPage == null) { //Check if we reach the page limit for the current page
                                page = 1;
                                console.log("Pulled page " + page + " for " + yearCount);
                                yearCount++;
                                dateString = dateObj.yearRequested[yearCount];

                                if(dateString==undefined){
                                    //console.log("Finished loading all years")
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
                //console.log('table-2-done-rendering');
                break;
        };
    };

    tableau.registerConnector(myConnector);
    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $('#submitButton').prop("disabled", true);
        document.getElementById('submitButton').style.backgroundColor = '#efefef'

        $('select').change(function(){
            //var selected_option = $(this).find(":selected").val();
            var years = $('#choose').val();
            var state = $('#state-fip').val();
            //console.log(`selected-years: ${years}`);
            //console.log(`selected-state: ${state}`);
            if (state !="" & years !="") {
                $('#submitButton').prop("disabled", false);
                document.getElementById('submitButton').style.backgroundColor = 'White';
                document.getElementById('error-message').style.visibility = 'hidden';      // Hide

            } else {
                $('#submitButton').prop("disabled", true);
                document.getElementById('submitButton').style.backgroundColor = '#efefef'
                document.getElementById('error-message').style.visibility = 'visible';
            }
          });
        
        $("#submitButton").click(function() {
            var dateObj = {
                yearRequested: $('#choose').val(),
                fipRequested:  $('#state-fip').val().trim(),
            };
            if (dateObj.yearRequested) {
                tableau.connectionData = JSON.stringify(dateObj); // Use this variable to pass data to your getSchema and getData functions
                tableau.connectionName = "IPEDS Awards Data for CIP 11"; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
            } else {
                $('#errorMsg').html("Enter a valid year. For example, 2018.");
            }
        });
    });
})();