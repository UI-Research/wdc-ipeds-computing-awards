
let savedCSVData; // Always a string

// Schema for Institution/College
institution_column_names = ["unitid_year", "unitid", "year", "inst_name", "state_abbr", "zip", "county_fips",
        "region", "cbsa", "congress_district_id", "inst_control", "institution_level", "hbcu", "tribal_college", "city"]
// Create the connector object
var myConnector = tableau.makeConnector();
console.log("1");
// Populate inputs if they were previously entered
myConnector.init = function(initCallback) {
    if (
    tableau.phase == tableau.phaseEnum.interactivePhase &&
    tableau.connectionData.length > 0
    ) {
    const conData = JSON.parse(tableau.connectionData);
    $("#url").val(conData.dataUrl || "");
    $("#choosen-years").val(conData.yearValue || "");
    $("#method").val(conData.method || "GET");
    $("#token").val(tableau.password || "");
    $("#delimiter").val(conData.delimiter || "");
    $("#encoding").val(conData.encoding || "");
    if (conData.fastMode) {
        _setMode("fast");
    }
    if (conData.mode) {
        _setMode(conData.mode);
    }
    }
    initCallback();
};
console.log("2");
// Define the schema
myConnector.getSchema = async function(schemaCallback) {

    // Standard connection specifies pre-joined tables
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
        var variable_metadata = await fetch('https://educationdata-stg.urban.org/api/v1/api-variables/?mode=tableauwdc')
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
                // unitid_year
                id: institution_column_names[0],
                alias: "ID-year",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                // unitid
                id: institution_column_names[1],
                alias: var_label[institution_column_names[1]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[1]]
            },
            {
                // year
                id: institution_column_names[2],
                alias: var_label[institution_column_names[2]],
                dataType: tableau.dataTypeEnum.date,
                description: var_description[institution_column_names[2]]
            },
            {
                // inst_name
                id: institution_column_names[3],
                alias: var_label[institution_column_names[3]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[3]]
            },
            {
                // state_abbr
                id: institution_column_names[4],
                alias: var_label[institution_column_names[4]],
                dataType: tableau.dataTypeEnum.string,
                geoRole: tableau.geographicRoleEnum.state_province,
                description: var_description[institution_column_names[4]]
            },
            {
                // zip
                id: institution_column_names[5],
                alias: var_label[institution_column_names[5]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[5]]
            },
            {
                // county_fips
                id: institution_column_names[6],
                alias: var_label[institution_column_names[6]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[6]]
            },
            {
                // region
                id: institution_column_names[7],
                alias: var_label[institution_column_names[7]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[7]]
            },
            {
                // cbsa
                id: institution_column_names[8],
                alias: var_label[institution_column_names[8]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[8]]
            },
            {
                // congress_district_id
                id: institution_column_names[9],
                alias: "114th congressional district identification number",
                dataType: tableau.dataTypeEnum.string,
                geoRole: tableau.geographicRoleEnum.congressional_district,
                description: var_description[institution_column_names[9]]
            },
            {
                // inst_control
                id: institution_column_names[10],
                alias: var_label[institution_column_names[10]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[10]]
            },
            {
                // institution_level
                id: institution_column_names[11],
                alias: var_label[institution_column_names[11]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[11]]
            },
            {
                // hbcu
                id: institution_column_names[12],
                alias: var_label[institution_column_names[12]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[12]]
            },
            {
                // tribal_college
                id: institution_column_names[13],
                alias: var_label[institution_column_names[13]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[13]]
            },
            {
                // city
                id: institution_column_names[14],
                alias: var_label[institution_column_names[14]],
                dataType: tableau.dataTypeEnum.string,
                description: var_description[institution_column_names[14]]
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
console.log("3");
// Download the data
myConnector.getData = async function(table, doneCallback){

    //variables to keep track of the number of years choosen
    let conData = JSON.parse(tableau.connectionData);
    let dataUrl = conData.dataUrl;
    let yearArray = conData.yearValue;
    let method = conData.method;
      let delimiter =
          conData.delimiter && conData.delimiter !== "" ? conData.delimiter : ",";
      let encoding =
          conData.encoding && conData.encoding !== "" ? conData.encoding : "";
      let token = tableau.password;
      let mode = conData.fastMode ? "fast" : conData.mode ? conData.mode : "typed";
      let row_index = 0;
      let size = 10000;
    switch(table.tableInfo.id) {
        case 'awards':
            //creating the csv url
            let dataUrlPrefix = "https://educationdata.urban.org/csv/ipeds/colleges_ipeds_completions-2digcip_";
            let dataUrlExtension = ".csv";
            // what is this for?
            var all_rows = [];
            for (let i = 0; i < yearArray.length; i++) {
              console.time("Getting awards data");
              let yearValue = yearArray[i];
              console.log(`Pull data year ${yearValue}`);
              let finalUrl = `${dataUrlPrefix}${yearValue}${dataUrlExtension}`;
              console.log(finalUrl)
              //data = savedCSVData || (await _retrieveCSVData({ finalUrl, method, token, encoding }));
              data = await _retrieveCSVData({ finalUrl, method, token, encoding });

              switch (mode) {
                case "fast":
                rows = _parse(data, delimiter, false).slice(1);
                break;
                case "typed":
                rows = _cleanData(_parse(data, delimiter, true));
                break;
                case "loosetyped":
                rows = _parse(data, delimiter, true).slice(1);
                break;
                default:
                rows = _cleanData(_parse(data, delimiter, true));
                }

                console.log(`Rows length ${rows.length}`);
                all_rows = all_rows.concat(rows);

            }
            console.log(`Combined length ${all_rows.length}`);

            //let row_index = 0;
            //let size = 10000;
            while (row_index < all_rows.length) {
                table.appendRows(all_rows.slice(row_index, size + row_index));
                row_index += size;
                tableau.reportProgress("Getting row: " + row_index);
            }
            console.timeEnd("Getting awards data");

            doneCallback();
            break;
        case 'institution':
            let finalUrl = "https://educationdata.urban.org/csv/ipeds/colleges_ipeds_directory.csv";
            console.log(finalUrl)
            console.time("Getting institution data");
            console.log(finalUrl)
            data = savedCSVData || (await _retrieveCSVData({ finalUrl, method, token, encoding }));
            data = await _retrieveCSVData({ finalUrl, method, token, encoding });
            console.log(data)
            console.log(mode)

            switch (mode) {
              case "fast":
              rows = _parse(data, delimiter, false).slice(1);
              break;
              case "typed":
              rows = _cleanData(_parse(data, delimiter, true));
              break;
              case "loosetyped":
              parsed_data = _parse(data, delimiter, true)
              rows = parsed_data.slice(1);
              header = parsed_data[0];
              break;
              default:
              rows = _cleanData(_parse(data, delimiter, true));
              }

            console.log(header)
            console.log(header)
            var headerLength = header.length;
            institutionColIndexes = [];
            header_col_count = 0;
            for (var i = 0; i < headerLength; i++) {
                if(institution_column_names.includes(header[i])){
                    //console.log(header[i]);
                    institutionColIndexes.push(i);
                    if (header[i] ==  "year"){
                        year_index = i;
                    }
                }
            }

            rows_subset = []
            rows.forEach((element) => {
              row_year = element[year_index].toString()
              console.log(row_year);
              console.log(yearArray)
              if (yearArray.includes(element[row_year])){
                  console.log("IN ARRAY INDEX")
                  row_subset = institutionColIndexes.map(i => element[i]);
                  row_subset.unshift(row_subset[0] + '-' + row_subset[1]);
                  rows_subset.push(row_subset);
                  }
            });


            console.log(institutionColIndexes)

            while (row_index < rows_subset.length) {
                table.appendRows(rows_subset.slice(row_index, size + row_index));
                row_index += size;
                tableau.reportProgress("Getting row: " + row_index);
            }
            console.timeEnd("Getting institution data");
            doneCallback();
            break;
    };
};
console.log("4");
tableau.connectionName = "CSV Data";
console.log("a");
tableau.registerConnector(myConnector);
console.log("b");

console.log("5");
// Grabs wanted fields and submits configuration to Tableau
async function _submitDataToTableau() {
    let dataUrl = $("#url")
      .val()
      .trim();
    let yearValue = $("#choosen-years").val();
    console.log(`eseye sa: ${yearValue}`);
    // let yearValue = conData.yearValue;
    //creating the csv url
    let dataUrlPrefix = "https://educationdata.urban.org/csv/ipeds/colleges_ipeds_completions-2digcip_";
    // let dataUrlPrefix = dataUrl.slice(0, 77)
    let extension = ".csv";
    let yearinit = yearValue[0];
    let finalUrl = `${dataUrlPrefix}${yearinit}${extension}`;
    let method = $("#method").val();
    let token = $("#token").val();
    let delimiter = $("#delimiter").val();
    let encoding = $("#encoding").val();
    let mode =
      $("#fast").attr("class") === "is-active"
        ? "fast"
        : $("#typed").attr("class") === "is-active"
        ? "typed"
        : "loosetyped";
    if (!finalUrl) return _error("No data entered.");
  
    const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|ftp:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
    const result = finalUrl.match(urlRegex);
    if (result === null) {
      _error("WARNING: URL may not be valid...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  
    tableau.connectionData = JSON.stringify({
      finalUrl,
      yearValue,
      method,
      delimiter,
      encoding,
      mode
    });
    tableau.password = token;
  
    tableau.submit();
}
  console.log("6");
// Gets data from CSV URL
async function _retrieveCSVData({ finalUrl, method, token, encoding }) {
    console.time("Fetching data");
    let result;
  
    try {
      let options = {
        method,
        
        headers: {
          "Content-Type": "application/json"
        }
      };
  
      if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
      }
      console.log("a");
      const response = await fetch(finalUrl, options);
      if (encoding && encoding !== "") {
        let buffer = await response.arrayBuffer();
        const decoder = new TextDecoder(encoding);
        result = decoder.decode(buffer);
      } else {
        result = await response.text();
      }
    } catch (error) {
      try {
        let options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            method,
            token,
            encoding
          })
        };
        const response = await fetch("/proxy/" + finalUrl, options);
        result = await response.text();
      } catch (error) {
        if (tableau.phase !== "interactive") {
          tableau.abortWithError(error);
        } else {
          _error(error);
        }
        return;
      }
    }
    console.log("b");
    if (!result || result.error) {
      if (tableau.phase !== "interactive") {
        console.error(result.error);
        tableau.abortWithError(result.error);
      } else {
        _error(result.error);
      }
      return;
    }
    savedCSVData = result;
    console.timeEnd("Fetching data");
    return savedCSVData;
}
  console.log("7");
// Sanitizes headers so they work in Tableau without duplicates
function _sanitizeKeys(fields) {
console.time("Sanitizing keys");
let headers = {};
for (let field of fields) {
    let newKey = field.replace(/[^A-Za-z0-9_]/g, "_");
    let safeToAdd = false;

    do {
    if (Object.keys(headers).includes(newKey)) {
        newKey += "_copy";
    } else {
        safeToAdd = true;
    }
    } while (!safeToAdd);

    headers[newKey] = { alias: field };
}
console.timeEnd("Sanitizing keys");
return headers;
}

// Parses csv to array of arrays
function _parse(csv, delimiter, dynamicTyping) {
    console.time("Parsing csv");
    const lines = Papa.parse(csv, {
        delimiter,
        newline: "\n",
        dynamicTyping
    }).data;
    console.timeEnd("Parsing csv");
    return lines;
}

// Determines column data types based on first 100 rows
function _determineTypes(lines) {
    console.time("Determining data types");
    let fields = lines.shift();
    let testLines = lines.slice(0, 100);
    let headers = _sanitizeKeys(fields);
    let headerKeys = Object.keys(headers);
    let rows = [];

    let counts = testLines.map(line => line.length);
    let lineLength = counts.reduce((m, c) =>
        counts.filter(v => v === c).length > m ? c : m
    );

    for (let line of testLines) {
        if (line.length === lineLength) {
        for (let index in headerKeys) {
            let header = headers[headerKeys[index]];
            let value = line[index];

            if (
            value === "" ||
            value === '""' ||
            value === "null" ||
            value === null
            ) {
            header.null = header.null ? header.null + 1 : 1;
            } else if (
            value === "true" ||
            value === true ||
            value === "false" ||
            value === false
            ) {
            header.bool = header.bool ? header.bool + 1 : 1;
            } else if (typeof value === "object") {
            header.string = header.string ? header.string + 1 : 1;
            } else if (!isNaN(value)) {
            if (parseInt(value) == value) {
                header.int = header.int ? header.int + 1 : 1;
            } else {
                header.float = header.float ? header.float + 1 : 1;
            }
            } else {
            header.string = header.string ? header.string + 1 : 1;
            }
        }
        } else {
        console.log("Row ommited due to mismatched length.", line);
        }
    }

    for (let field in headers) {
        // strings
        if (headers[field].string) {
        headers[field].dataType = "string";
        continue;
        }
        // nulls
        if (Object.keys(headers[field]).length === 1 && headers[field].null) {
        headers[field].dataType = "string";
        continue;
        }
        // floats
        if (headers[field].float) {
        headers[field].dataType = "float";
        continue;
        }
        // integers
        if (headers[field].int) {
        headers[field].dataType = "int";
        continue;
        }
        // booleans
        if (headers[field].bool) {
        headers[field].dataType = "bool";
        continue;
        }
        headers[field].dataType = "string";
    }

    console.timeEnd("Determining data types");
    return headers;
}

// Tries to clean up data to appropriately match data types
function _cleanData(lines) {
    console.time("Cleaning data");
    let fields = lines.shift();
    let headers = _sanitizeKeys(fields);
    let headerKeys = Object.keys(headers);
    let rows = [];

    let counts = lines.map(line => line.length);
    let lineLength = counts.reduce((m, c) =>
        counts.filter(v => v === c).length > m ? c : m
    );

    for (let line of lines) {
        if (line.length === lineLength) {
        let obj = {};
        let headerKeys = Object.keys(headers);
        for (let field in headerKeys) {
            let header = headers[headerKeys[field]];
            let value = line[field];

            if (
            value === "" ||
            value === '""' ||
            value === "null" ||
            value === null
            ) {
            obj[headerKeys[field]] = null;
            } else if (value === "true" || value === true) {
            obj[headerKeys[field]] = true;
            } else if (value === "false" || value === false) {
            obj[headerKeys[field]] = false;
            } else if (typeof value === "object") {
            obj[headerKeys[field]] = value.toISOString();
            } else if (!isNaN(value)) {
            obj[headerKeys[field]] = value;
            } else {
            obj[headerKeys[field]] = value;
            }
        }
        rows.push(obj);
        } else {
        console.log("Row ommited due to mismatched length.", line);
        }
    }
    console.timeEnd("Cleaning data");
    return rows;
}

// Show/hide advanced options
function toggleAdvanced() {
    $("#advanced").toggleClass("hidden");
}

// Shows error message below submit button
function _error(message) {
    $(".error")
        .fadeIn("fast")
        .delay(3000)
        .fadeOut("slow");
    $(".error").html(message);
    $("html, body").animate({ scrollTop: $(document).height() }, "fast");
}

// Changes mode
function _setMode(mode) {
    $("#typed,#fast,#loosetyped").each(function() {
        $(this).removeClass("is-active");
    });
    $(`#${mode}`).addClass("is-active");
}

// Submits when you push Enter
$("#url").keypress(function(event) {
    if (event.keyCode === 13) {
        _submitDataToTableau();
    }
});

// Allows you to enter a tab as the delimiter
$("#delimiter").keydown(function(event) {
    if (event.keyCode === 9) {
        event.preventDefault();
        $("#delimiter").val("\t");
    }
});