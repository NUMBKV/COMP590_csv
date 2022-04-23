import {multpileDateHeader, singleDateHeader} from "./data";
import axios from "axios";
import {backendTo} from "../backend/backendUtils";

export function attributeList(str, delim=','){
    const headers = str.slice(0,str.indexOf('\n')).split(delim);
    return headers;
}

export function attributeValueList(arr, attribute){
    let list = [];
    for(let i = 0; i < arr.length; i += 1){
        let row = arr[i];

        for(const [key, value] of Object.entries(row)){
            if(key === attribute){
                list.push(value);
            }
        }
    }

    return list;
}

export function processCSV(str, delim=','){
    const headers = str.slice(0,str.indexOf('\n')).split(delim);
    const rows = str.slice(str.indexOf('\n')+1).split('\n');

    const newArray = rows.map( row => {
        const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const eachObject = headers.reduce((obj, header, i) => {
            obj[header] = values[i];
            return obj;
        }, {})
        return eachObject;
    })
    return newArray;
}


export function isDateHeader(attributeList){
    let dateHeader = false;
    for(let i = 0; i < attributeList.length; i += 1){
        if(isDate(attributeList[i])){
            dateHeader = true;
            break;
        }
    }
    return dateHeader;
}


export function processData(arr, attributeList, attributeName){

    let dateHeader = false;
    for(let i = 0; i < attributeList.length; i += 1){
        if(isDate(attributeList[i])){
            dateHeader = true;
            break;
        }
    }

    if(dateHeader){

        return parseDateHeader(arr, attributeName);
    } else {
        return parseNoDateHeader(arr, attributeName);
    }
}

export async function getJSONFromUrl(url) {
    let postURLOption = {
        credentials: 'include',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"url": url})
    };

    try {
        const response = await fetch(backendTo("csv2Json"), postURLOption)
        if (response.status === 401) {
            return [];
        }
        let file = await response.json();
        let data = file.result;
        return [data];

    }catch (e){
        return "error";
    }

}

export function parseDateHeader(arr, attributeName){
    let data2020 = Array(12).fill(0).map(row => new Array(31).fill().map(Object));
    let data2021 = Array(12).fill(0).map(row => new Array(31).fill().map(Object));
    let data2022 = Array(12).fill(0).map(row => new Array(31).fill().map(Object));

    for(let i = 0; i < arr.length; i += 1){
        let currentRow = arr[i], attributeValue = currentRow[attributeName];
        for(const [key, value] of Object.entries(currentRow)){
            if(isDate(key)){
                let dateList = returnDateList(key);
                let month = dateList[0], day = dateList[1], year = dateList[2];
                switch (year){
                    case 20:
                        data2020[month - 1][day - 1][attributeValue] = value;
                        break;
                    case 21:
                        data2021[month - 1][day - 1][attributeValue] = value;
                        break;
                    default:
                        data2022[month - 1][day - 1][attributeValue] = value;
                }
            }
        }
    }


    let object = {};
    object["2020"] = data2020;
    object["2021"] = data2021;
    object["2022"] = data2022;
    return object;
}
export function parseNoDateHeader(arr, attributeName){
    let data2020 = Array(12).fill(0).map(row => new Array(31).fill().map(Object));
    let data2021 = Array(12).fill(0).map(row => new Array(31).fill().map(Object));
    let data2022 = Array(12).fill(0).map(row => new Array(31).fill().map(Object));

    for(let i = 0; i < arr.length; i += 1){
        let currentRow = arr[i];
        let dateList = returnDateList(arr[i][attributeName]);
        let month = dateList[0], day = dateList[1], year = dateList[2];
        let emptyRow = false;
        for (const [key, value] of Object.entries(currentRow)) {
             if(value === "" || value === undefined){
                 console.log("emptyRow");
                 emptyRow = true;
                 break;
             }
             currentRow[key] = currentRow[key].replace(/(\r\n|\n|\r)/gm, "");

        }
        if(emptyRow){
            console.log("empty row:" + currentRow)
            continue;
        }
        if(year >= 2020){
            year = parseInt((year / 100));
        }
        switch (year){
            case 20:
                data2020[month - 1][day - 1] = currentRow;
                break;
            case 21:
                data2021[month - 1][day - 1] = currentRow;
                break;
            default:
                data2022[month - 1][day - 1] = currentRow;
        }
    }
    console.log(data2020);
    return {"2020": data2020, "2021": data2021, "2022": data2022};
}

export function isDate(date){
    return date.split("/").length === 3;
}

export function returnDateList(str) {
    let splitList = str.split("/");
    for(let i = 0; i < splitList.length; i += 1) {
        splitList[i] = parseInt(removeSpace(splitList[i]));
    }
    return splitList;
}

export function removeSpace(str){
    return str.replace(/\s+/g, "");
}

export function isEmptyObject(obj){
    return JSON.stringify(obj) === "{}";
}

export function returnDropDownOption(list){
    let optionList = [];
    let newList = removeDuplicates(list);
    for(let i = 0; i < newList.length; i += 1){
        let obj = {"key": newList[i], "text": newList[i], "value": newList[i]};
        optionList.push(obj);
    }

    return optionList;
}

export function removeDuplicates(list){
    let obj = {};
    return list.map(function (ele){
        if(!obj[ele]){
            obj[ele] = true;
            return ele;
        }
    })

}

export function exampleUrl(str){
    let url = "https://raw.githubusercontent.com/";
    url += "NUMBKV/COMP590-Data-Processing/main/daily_cases/new_daily_states_county/confirmed_cases_";
    url += str.toString().toLowerCase() + ".csv";
    return url;
}

export function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str) && str.includes("csv");
}