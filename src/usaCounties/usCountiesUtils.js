import {abbrState, jsonParseStringify} from "../CountyView/countyViewUtil";
import {USACounties} from "./usaCounties";

export function returnFullNameList(){
    let stateFullNameList = []
    for(let i = 0; i < stateFullInitList.length; i += 1){

        stateFullNameList.push(stateFullInitList[i][0]);
    }
    return stateFullNameList;
}

export function dropDownStateFullNameList(){
    let list = returnFullNameList();
    let option = [];
    for(let i = 0; i < list.length; i += 1){
        let object = {};
        object["text"] = list[i];
        object["key"] = i;
        object["value"] = abbrState(list[i], 'abbr');
        option.push(object)
    }
    return option;
}


export function generateSVGMap(stateName){
    let usaMap = USACounties();
    let locationList = usaMap["locations"];
    let object = {};
    object["locations"] = [];
    for(let i = 0; i < locationList.length; i += 1){
        let stateInRow = locationList[i].name.split(",")[1].replace(/\s/g, "");
        if(stateName === stateInRow){
            object["locations"].push(locationList[i]);
        }

    }
    object.labels = usaMap.label;
    object.viewBox = usaMap.viewBox

    console.log(usaMap);
    console.log(object);
    return object;
}

export function returnInitNameList(){
    let stateInitNameList = []

    for(let i = 0; i < stateInitNameList.length; i += 1){
        stateInitNameList.push(stateFullInitList[i][1]);
    }
    return stateFullInitList;
}

export function parseCountyList(data){
    let dataCounty = jsonParseStringify(data);
    return Object.keys(dataCounty[0][0]);
}


export const stateFullInitList = [
    ['Arizona', 'AZ'],
    ['Alabama', 'AL'],
    ['Alaska', 'AK'],
    ['Arkansas', 'AR'],
    ['California', 'CA'],
    ['Colorado', 'CO'],
    ['Connecticut', 'CT'],
    ['Delaware', 'DE'],
    ['Florida', 'FL'],
    ['Georgia', 'GA'],
    ['Hawaii', 'HI'],
    ['Idaho', 'ID'],
    ['Illinois', 'IL'],
    ['Indiana', 'IN'],
    ['Iowa', 'IA'],
    ['Kansas', 'KS'],
    ['Kentucky', 'KY'],
    ['Louisiana', 'LA'],
    ['Maine', 'ME'],
    ['Maryland', 'MD'],
    ['Massachusetts', 'MA'],
    ['Michigan', 'MI'],
    ['Minnesota', 'MN'],
    ['Mississippi', 'MS'],
    ['Missouri', 'MO'],
    ['Montana', 'MT'],
    ['Nebraska', 'NE'],
    ['Nevada', 'NV'],
    ['New Hampshire', 'NH'],
    ['New Jersey', 'NJ'],
    ['New Mexico', 'NM'],
    ['New York', 'NY'],
    ['North Carolina', 'NC'],
    ['North Dakota', 'ND'],
    ['Ohio', 'OH'],
    ['Oklahoma', 'OK'],
    ['Oregon', 'OR'],
    ['Pennsylvania', 'PA'],
    ['Rhode Island', 'RI'],
    ['South Carolina', 'SC'],
    ['South Dakota', 'SD'],
    ['Tennessee', 'TN'],
    ['Texas', 'TX'],
    ['Utah', 'UT'],
    ['Vermont', 'VT'],
    ['Virginia', 'VA'],
    ['Washington', 'WA'],
    ['West Virginia', 'WV'],
    ['Wisconsin', 'WI'],
    ['Wyoming', 'WY'],
];

export const defaultLabelList = ['4/16/20', '5/9/20', '5/13/20', '5/14/20', '6/17/20', '6/19/20', '6/24/20', '6/27/20', '6/30/20', '7/1/20', '7/2/20', '7/3/20', '7/7/20', '7/8/20', '7/9/20', '7/10/20', '7/11/20', '7/14/20', '7/16/20', '7/17/20', '7/18/20', '7/21/20', '7/22/20', '7/23/20', '7/24/20', '7/29/20', '7/30/20', '8/6/20', '8/7/20', '8/11/20', '8/15/20', '8/19/20', '8/20/20', '8/26/20', '9/4/20', '9/11/20', '9/17/20', '9/18/20', '9/22/20', '9/28/20', '10/3/20', '10/6/20', '10/8/20', '10/13/20', '10/20/20', '10/27/20', '10/29/20', '10/31/20', '11/1/20', '11/3/20', '11/5/20', '11/7/20', '11/14/20', '11/16/20', '11/18/20', '11/19/20', '11/20/20', '11/23/20', '11/25/20', '12/1/20', '12/3/20', '12/5/20', '12/7/20', '12/8/20', '12/9/20', '12/10/20', '12/11/20', '12/12/20', '12/14/20', '12/15/20', '12/17/20', '12/18/20', '12/19/20', '12/23/20', '12/25/20', '12/28/20', '12/29/20', '12/30/20'];
