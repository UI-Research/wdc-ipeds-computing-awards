let savedCSVData; // Always a string

// Schema for Institution/College
institution_column_names = ["unitid", "year", "inst_name", "state_abbr", "zip", "county_fips",
        "region", "cbsa", "congress_district_id", "inst_control", "institution_level", "hbcu", "tribal_college", "city"]
institution_column_datatype = {"unitid":"string",
                            "year":"date",
                            "inst_name":"string",
                            "state_abbr":"string",
                            "zip":"string",
                            "county_fips":"string",
                            "region":"string",
                            "cbsa":"string",
                            "congress_district_id":"string",
                            "inst_control":"string",
                            "institution_level":"string",
                            "hbcu":"string",
                            "tribal_college":"string",
                            "city":"string"}
institution_column_georole = {"state_abbr": "state_province", "congress_district_id": "congressional_district"}
awards_column_names = ["unitid", "year", "fips", "cipcode", "award_level", "majornum", "sex", "race", "awards"]
awards_column_datatype = {"unitid": "string",
                      "year": "date",
                      "fips": "string",
                      "cipcode": "string",
                      "award_level": "string",
                      "majornum": "string",
                      "sex": "string",
                      "race": "string",
                      "awards": "int"
                      }
// Create the connector object
var myConnector = tableau.makeConnector();
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

// Define the schema
myConnector.getSchema = async function(schemaCallback) {

        // Get metadata
        var variable_metadata = await fetch('https://educationdata-stg.urban.org/api/v1/api-variables/?mode=tableauwdc')
            .then(response => response.json());
        var variable_metadata_feat = variable_metadata.results;
        var var_description = {};
        var var_label = {};
        variable_metadata_feat.forEach(function (arrayItem) {
            var_description[arrayItem.variable] = arrayItem.description;
            var_label[arrayItem.variable] = arrayItem.label;
        });

        // get completion column data
        let completionCols = _getColumnData(awards_column_names, awards_column_datatype, [], var_label, var_description);

        let completionTable = {
            id: "awards",
            alias: "Awards",
            columns: completionCols
        };

        // get institution column data
        let institutionCols = _getColumnData(institution_column_names, institution_column_datatype, institution_column_georole, var_label, var_description);

       let institutionTable = {
            id: "institution",
            alias: "Institution",
            columns: institutionCols
        };

        all_tables = [completionTable, institutionTable]

        // metadata tables
        metadata_vars = ["award_level", "majornum", "sex", "race"]
        metadata_vars.forEach(function (item, index) {
            recoded_varname = item.concat('_recoded');
            table_name = "metadata_".concat(item);
            table_alias = "Awards Code Label - ".concat(item);
            // Schema for Metadata
            var metadataCols = [
                {
                    id: item,
                    alias: item,
                    dataType: tableau.dataTypeEnum.string
                },
                {
                    id: recoded_varname,
                    alias: recoded_varname,
                    dataType: tableau.dataTypeEnum.string,
                }
            ];
            var metadataTable = {
                id: table_name,
                alias: table_alias,
                columns: metadataCols
            };
            all_tables.push(metadataTable)
        });

        schemaCallback(all_tables);
};
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
      var variable_metadata = await fetch('https://educationdata-stg.urban.org/api/v1/api-values/?mode=tableauwdc')
            .then(response => response.json());
      var variable_metadata_feat = variable_metadata.results;
    switch(table.tableInfo.id) {
        case 'awards':
            let dataUrlPrefix = "https://educationdata.urban.org/csv/ipeds/colleges_ipeds_completions-2digcip_";
            let dataUrlExtension = ".csv";
            var all_rows = [];
            for (let i = 0; i < yearArray.length; i++) {
              console.time("Getting awards data");
              let yearValue = yearArray[i];
              let finalUrl = `${dataUrlPrefix}${yearValue}${dataUrlExtension}`;
              console.log(`Pull data from ${finalUrl}`);
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
                parsed_data = _parse(data, delimiter, true)
                rows = parsed_data.slice(1);
                header = parsed_data[0];
                break;
                default:
                rows = _cleanData(_parse(data, delimiter, true));
                }
                all_rows = all_rows.concat(rows);
            }
            console.log(`Combined length ${all_rows.length}`);

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
            console.time("Getting institution data");
            data = savedCSVData || (await _retrieveCSVData({ finalUrl, method, token, encoding }));
            data = await _retrieveCSVData({ finalUrl, method, token, encoding });
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

            // filter to desired year(s)
            year_index = _getYearIndex(institution_column_names, header);
            yearArray = yearArray.map(Number);
            const rows_filtered_to_years = rows.filter(row => yearArray.includes(row[year_index]));
            rows_ordered = _orderRows(institution_column_names, header, rows_filtered_to_years);

            var var_label_variable_list = ["region","inst_control", "institution_level"]
            var label_dictionary = {}
            var_label_variable_list.forEach(item =>
                label_dictionary[item] = {}
            );

            variable_metadata_feat.forEach(function (arrayItem) {
                if(var_label_variable_list.includes(arrayItem.format_name)){
                    label_dictionary[arrayItem.format_name][arrayItem.code] = arrayItem.code_label.split(" - ")[1]
                    if(arrayItem.format_name=="region"){
                        label_dictionary[arrayItem.format_name][arrayItem.code] = label_dictionary[arrayItem.format_name][arrayItem.code].split(":")[0]
                    };
                };
            });

            rows_final = _recodeInstitutionData(rows_ordered, var_label_variable_list, institution_column_names, label_dictionary)

            while (row_index < rows_final.length) {
                table.appendRows(rows_final.slice(row_index, size + row_index));
                row_index += size;
                tableau.reportProgress("Getting row: " + row_index);
            }
            console.timeEnd("Getting institution data");
            doneCallback();
            break;
        case 'metadata_award_level':
            var variable_name = "award_level"
            var tableData = [];
            variable_metadata_feat.forEach(function (arrayItem) {
                if(variable_name==arrayItem.format_name){
                    tableData.push({
                        award_level: arrayItem.code,
                        award_level_recoded: arrayItem.code_label
                    });
                };
            });
            table.appendRows(tableData);
            doneCallback();
            break;
        case 'metadata_majornum':
            var variable_name = "majornum"
            var tableData = [];
            variable_metadata_feat.forEach(function (arrayItem) {
                if(variable_name==arrayItem.format_name){
                    tableData.push({
                        majornum: arrayItem.code,
                        majornum_recoded: arrayItem.code_label
                    });
                };
            });
            table.appendRows(tableData);
            doneCallback();
            break;
        case 'metadata_sex':
            var variable_name = "sex"
            var tableData = [];
            variable_metadata_feat.forEach(function (arrayItem) {
                if(variable_name==arrayItem.format_name){
                    tableData.push({
                        sex: arrayItem.code,
                        sex_recoded: arrayItem.code_label
                    });
                };
            });
            table.appendRows(tableData);
            doneCallback();
            break;
        case 'metadata_race':
            var variable_name = "race"
            var tableData = [];
            variable_metadata_feat.forEach(function (arrayItem) {
                if(variable_name==arrayItem.format_name){
                    tableData.push({
                        race: arrayItem.code,
                        race_recoded: arrayItem.code_label
                    });
                };
            });
            table.appendRows(tableData);
            doneCallback();
            break;
    };
};
tableau.connectionName = "CSV Data";
tableau.registerConnector(myConnector);

function _getTableData(variable_name, variable_metadata_feat){
            var recoded_varname = variable_name.concat('_recoded');
            var tableData = [];
            variable_metadata_feat.forEach(function (arrayItem) {
                if(variable_name==arrayItem.format_name){
                    tableData.push({
                        sex: arrayItem.code,
                        sex_recoded: arrayItem.code_label.split(" - ")[1]
                    });
                };
            });

           return tableData;
}

const zeroPad = (num, places) => String(num).padStart(places, '0')

function _recodeInstitutionData(data, var_list, column_header, label_dictionary){
    var keys = Object.keys(label_dictionary);
    total_length = data.length
    var i = 0;

    zip_index = column_header.indexOf("zip");
    county_fips_index = column_header.indexOf("county_fips");
    congress_district_id_index = column_header.indexOf("congress_district_id");

    const data_cleaned = data.map(obj => {

        // clean zip
        if(obj[zip_index] != null){
            obj[zip_index] = zeroPad(obj[zip_index].toString().split('-')[0], 5);
        } else{
            obj[zip_index] = null;
        }

        // clean county fips
        if(obj[county_fips_index] != null){
            obj[county_fips_index] = zeroPad(obj[county_fips_index], 5);
        } else{
            obj[county_fips_index] = null;
        }

        // clean congress_district_id
        if(obj[congress_district_id_index] != null){
            obj[congress_district_id_index] = Number((obj[congress_district_id_index].toString()).slice(-2)).toString();
        } else{
            obj[congress_district_id_index] = null;
        }

        // recode
        var_list.forEach(function(var_name){
            index = column_header.indexOf(var_name);
            if(obj[index] != null){
                obj[index] = label_dictionary[var_name][obj[index]];
            } else {
                obj[index] = null;
            };
        });
        i = i + 1
        return obj;

    });
    return data_cleaned
}

function _getColumnData(column_names, column_datatype, column_georole, var_label, var_description){
    cols=[]
    headerLength = column_names.length
    for (var i = 0; i < headerLength; i++){
        field = column_names[i];
        field_description = {
            id: field,
            alias: var_label[field],
            dataType: column_datatype[field],
            description: var_description[field]
            }
        if (field in column_georole){
            field_description["geoRole"] = column_georole[field]
        }
        cols.push(field_description)
   }

   return cols
}

function _orderRows(tableau_col_order, csv_header_full, data) {
    var tableau_col_length = tableau_col_order.length;
    tableau_col_indexes = [];
    tableau_col_order.forEach(function(tableau_col){
        index = csv_header_full.indexOf(tableau_col);
        tableau_col_indexes.push(index);
   });

    const data_ordered = data.map(obj => {
        obj = tableau_col_indexes.map(i => obj[i]);
        return obj;
    });

 return data_ordered
}

function _getYearIndex(tableau_col_order, csv_header_full) {
    var headerLength = header.length;
    institutionColIndexes = [];
    header_col_count = 0;
    for (var i = 0; i < headerLength; i++) {
        if (header[i] ==  "year"){
            year_index = i;
        }
    }
 return year_index
}

// Grabs wanted fields and submits configuration to Tableau
async function _submitDataToTableau() {
    let dataUrl = $("#url")
      .val()
      .trim();
    let yearValue = $("#choosen-years").val();
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