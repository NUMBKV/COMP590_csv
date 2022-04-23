import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    registerables as registerablesJS
} from 'chart.js';

import { Bar, Chart} from 'react-chartjs-2';
import {Label} from "semantic-ui-react";
import {Grid} from "@mui/material";
import {stateFullInitList} from "../usaCounties/usCountiesUtils";
ChartJS.register(...registerablesJS);


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,

);


export function calculateBothYearData(data2020, data2021, selectedCountyName){
    let calculateList2020 = validDataDays(data2020, selectedCountyName), calculateList2021 = validDataDays(data2021, selectedCountyName);
    let labelList = calculateList2020[0].concat(calculateList2021[0]), dataList = calculateList2020[1].concat(calculateList2021[1]);

    return [labelList, dataList];
}

export function generateNewView(bottomLabel, objData){
    let oneView = {
        labels: [],
        datasets: []
    };

    oneView.labels = bottomLabel;

    oneView.datasets.push(objData);

    return oneView;

}

export function searchBarManyChartsFunction(data2020, data2021,selectedList, selectedYear, shiftDays= 0, movingAverageDays= 0, medianFilterDays= 0, applyAll = true, lgdisplay=6, split=false, removeOutlier=false, selectedArr=[]){
    let dataInput = jsonParseStringify(data2020);
    let viewList = [], bothYears = false;



    if(selectedYear === "2020"){
        dataInput = jsonParseStringify(data2020);
    } else if(selectedYear === "2021"){
        dataInput = jsonParseStringify(data2021);
    } else {
        bothYears = true;
    }
    let splitArray = [];

    if(selectedArr.length === 3){
        if(selectedArr[0] === "2020"){
            dataInput = jsonParseStringify(data2020);
        } else {
            dataInput = jsonParseStringify(data2021);
        }
    }



    console.log("shiftDays: " + shiftDays);
    console.log("movingAverageDays: " + movingAverageDays);
    console.log("medianFilterDays: " + medianFilterDays);
    for(let i = 0; i < selectedList.length; i += 1){
        let colorUsedList = [color_list[i % color_list.length]];
        let oneView = {
            labels: [],
            datasets: []
        };
        let movingAverageView = {
            labels:[],
            datasets:[],
        }
        let medianFilterView = {
            labels:[],
            datasets:[],
        }
        let movingAverageMedianFilterView = {
            labels:[],
            datasets:[],
        }

        let selectCountyName = selectedList[i].name;
        let monthFrom = 1, monthTo = 12;
        if(selectedArr.length === 3) {
            monthFrom = returnMonthIndex(selectedArr[1]);
            monthTo = returnMonthIndex(selectedArr[2]);
        }
        let calculateList = JSON.parse(JSON.stringify(validDataDays(dataInput, selectCountyName, monthFrom, monthTo)));
        if(bothYears){
            calculateList = calculateBothYearData(jsonParseStringify(data2020), jsonParseStringify(data2021), selectCountyName );
        }
        splitArray = [];
        let bottomLabel = calculateList[0], graphDataPoint = calculateList[1];

        oneView.labels = bottomLabel;
        movingAverageView.labels = bottomLabel;
        medianFilterView.labels = bottomLabel;
        movingAverageMedianFilterView.labels = bottomLabel;

        oneView.datasets.push({
            type: 'bar',
            label: selectCountyName,
            backgroundColor: color_list[i % color_list.length],
            borderColor: color_list[i % color_list.length],
            borderWidth: 1,
            pointRadius: 0,
            data: jsonParseStringify(filterOutliers(graphDataPoint, removeOutlier)),
        });
        calculateList[1] = jsonParseStringify(filterOutliers(calculateList[1], removeOutlier));
        if(medianFilterDays){
            let medianFilterList = medianFilterHelper(calculateList[1], medianFilterDays);
            let colorPicked = findUsefulColor(colorUsedList);
            let label = " Day Median Filter";
            if(medianFilterDays >= 2){
                label = " Days Median Filter";
            }

            if(split){
                medianFilterView.datasets.push({
                    type: 'bar',
                    label: medianFilterDays + label,
                    backgroundColor: colorPicked,
                    borderColor: colorPicked,
                    borderWidth:3,
                    data: medianFilterList,
                });
            } else{
                oneView.datasets.push({
                    type: 'line',
                    label: medianFilterDays + label,
                    backgroundColor: colorPicked,
                    borderColor: colorPicked,
                    borderWidth:3,
                    data: medianFilterList,
                });
            }
            colorUsedList.push(colorPicked);
        }

        if(movingAverageDays){
            let movingAverageList = movingAverageHelper(calculateList[1], movingAverageDays);
            let colorPicked = findUsefulColor(colorUsedList);
            let label = " Moving Average Day";
            if(movingAverageDays >= 2){
                label = " Moving Average Days";
            }
            if(split){
                movingAverageView.datasets.push({
                    type: 'bar',
                    pointRadius: 0,
                    label: movingAverageDays + label,
                    backgroundColor: colorPicked,
                    borderColor: colorPicked,
                    borderWidth: 3,
                    data: movingAverageList,
                });
            } else {
                oneView.datasets.push({
                    type: 'line',
                    pointRadius: 0,
                    label: movingAverageDays + label,
                    backgroundColor: colorPicked,
                    borderColor: colorPicked,
                    borderWidth: 3,
                    data: movingAverageList,
                });
            }


            colorUsedList.push(colorPicked);
        }


        if(medianFilterDays && movingAverageDays){
            let medianFilterList = medianFilterHelper(calculateList[1], medianFilterDays);
            let movingAverageList = movingAverageHelper(medianFilterList, movingAverageDays);
            let colorPicked = findUsefulColor(colorUsedList);

            if(split){
                movingAverageMedianFilterView.datasets.push({
                    type: 'bar',
                    label: `${medianFilterDays} median filter days and ${movingAverageDays} moving average days `,
                    backgroundColor: colorPicked,
                    borderColor: colorPicked,
                    borderWidth: 1,
                    data: movingAverageList,
                });
            }else{
                oneView.datasets.push({
                    type: 'line',
                    label: `${medianFilterDays} median filter days and ${movingAverageDays} moving average days`,
                    backgroundColor: colorPicked,
                    borderColor: colorPicked,
                    borderWidth: 1,
                    data: medianFilterList,
                });
            }

            colorUsedList.push(colorPicked);
        }

        viewList.push(graphView(oneView));
        if(split){

            viewList.push(graphView(medianFilterView, "Median Filter"+"(" + selectCountyName + ")"));
            viewList.push(graphView(movingAverageView, "Moving average"+"(" + selectCountyName + ")"));
            viewList.push(graphView(movingAverageMedianFilterView, "MF+MA" + "(" + selectCountyName + ")"));
        }
    }

    if (viewList.length <= 1) {
        return (<div>{viewList}</div>);
    }

    return (
        <Grid container spacing={2}>
            {viewList.map(view => (
                <Grid item sm={12} md = {6} lg={lgdisplay}>
                    {view}
                </Grid>
            ))}
        </Grid>
    );


}

export function returnMonthIndex(month){
    let val = 1;
    for(let i = 0; i < monthList.length; i += 1){
        if(monthList[i] === month){
            val = i + 1;
            break;
        }
    }
    return val;
}

export function returnMonthArray(dataInput, monthStart, monthTo){
    let a = returnMonthIndex(monthStart);
    let b = returnMonthIndex(monthTo);
    let arr = jsonParseStringify(dataInput);
    for(let i = 0; i < dataInput.length; i += 1){
        let row = dataInput[i].length;
        for(let j = 0; j < row.length; j += 1) {
            if(i >= a && i <= b){

            } else{
                arr[i][j] = 0;
            }
        }
    }
    return arr;
}

export function findUsefulColor(colorUsedList){
    console.log(colorUsedList)
    let copyColorList = JSON.parse(JSON.stringify(color_list));
    for(let i = 0; i < colorUsedList.length; i += 1){
        let usedColor = colorUsedList[i];
        copyColorList = JSON.parse(JSON.stringify(copyColorList.filter(function(ele){
            return ele !== usedColor;
        })));

    }
    if(copyColorList.length >= 1){
        return copyColorList[0];
    } else {
        return color_list[0];
    }
}

export function searchBarAllInOneFunction(data2020, data2021,selectedList, selectedYear){
    console.log(selectedList);
    let allInOneView = {

        labels: [],
        datasets: []
    };
    let bothYears = false;
    let dataInput = JSON.parse(JSON.stringify(data2020));
    if(selectedYear === "2020"){
        dataInput = JSON.parse(JSON.stringify(data2020));
    } else if(selectedYear === "2021"){
        dataInput = JSON.parse(JSON.stringify(data2021));
    } else {
        bothYears = true;
    }

    for(let i = 0; i < selectedList.length; i += 1){
        let selectCountyName = selectedList[i].name;

        let calculateList = JSON.parse(JSON.stringify(validDataDays(dataInput, selectCountyName)));
        if(bothYears){
            calculateList = calculateBothYearData(JSON.parse(JSON.stringify(data2020)), JSON.parse(JSON.stringify(data2021)), selectCountyName);
        }

        let bottomLabel = calculateList[0], graphDataPoint = calculateList[1];

        if(allInOneView.labels.length === 0){
            allInOneView.labels = bottomLabel;
        }
        allInOneView.datasets.push({
            type: 'line',
            label: selectCountyName,
            backgroundColor: color_list[i % color_list.length],
            borderColor: color_list[i % color_list.length],
            borderWidth: 1,
            data: graphDataPoint,
        })
    }


    return graphView(allInOneView);
}
export const color_list = ['rgba(255, 99, 132, 0.5)',
    'rgba(54, 162, 235, 0.5)',
    'rgba(255, 206, 86, 0.5)',
    'rgba(75, 192, 192, 0.5)',
    'rgba(153, 102, 255, 0.5)',
    'rgba(255, 159, 64, 0.5)', '#FF4500', '#FF0000'];

export function jsonParseStringify(object){
    return JSON.parse(JSON.stringify(object));
}

export function validDataDays(inputData, countyName, monthFrom=1, monthTo=12){

    let returnBottomLabel = [], returnGraphDataPoint = [];
    let year = 21;
    if(JSON.stringify(inputData[0][0]) === '{}'){
        year = 20;
    }
    console.log(monthFrom, monthTo)
    for(let month = 1; month <= inputData.length; month += 1){
        const monthPadded = pad(month);
        for(let day = 1; day <= datemap[month]; day += 1){
            const dayPadded = pad(day);
            const countyData = inputData[month - 1][day - 1][countyName];

            if(countyData && countyData >= 1 && month >= monthFrom &&  month <= monthTo){
                returnBottomLabel.push(month + "/" + day + "/" + year)
                returnGraphDataPoint.push(parseInt(countyData));
            }

        }
    }

    return [returnBottomLabel, returnGraphDataPoint];
}
export function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

export function medianFilterHelper(dataList, numOfDays){
    let filterList = [];
    for(let i = 0; i < dataList.length; i += 1){
        let currentValue = dataList[i], numOfDaysArray = [];

        for(let j = i; j < i + numOfDays; j += 1){
            numOfDaysArray.push(dataList[j % (dataList.length)]);
        }
        numOfDaysArray.sort();
        filterList.push(numOfDaysArray[parseInt(numOfDays / 2)]);
    }
    return filterList;
}

export function movingAverageHelper(dataList, numOfDays) {
    if(numOfDays === 0){
        return dataList;
    }
    let movingAverageList = [];
    for(let i = 0; i < dataList.length; i += 1) {
        let currentValue = dataList[i], numDaysList= [];
        for(let j = i - 1; j < i  - 1 + numOfDays; j += 1){
            numDaysList.push(dataList[j]);
        }
        let sum = numDaysList.reduce(function (acc, val){return acc + val;}, 0);
        if(sum){
            currentValue = sum/numOfDays;
        }
        movingAverageList.push(currentValue);
    }
    return movingAverageList;
}

export const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
//https://levelup.gitconnected.com/different-ways-to-check-if-an-object-is-empty-in-javascript-e1252d1c0b34
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

export const multipleStyle = {
    chips: { // To change css chips(Selected options)
        background: '#191970',
        alignItems: 'center',
        borderRadius: '5px',
        border: '1px solid #191970',
    },
}

export function countyNameListToSearchBarOption(list){
    let outputArray = [];
    for(let i = 0; i < list.length;i += 1){
        let object = {};
        object.name = list[i];
        object.id = list[i];
        outputArray.push(object);
    }
    return JSON.parse(JSON.stringify(outputArray));
}

export const dropDownSearchOption = [
    { text: '2020', value: 0 },
    { text: '2021', value: 1 },
    { text: 'Both', value: 2 },
];

export const dropDownOptionValueTo = {
    0:"2020",
    1:"2021",
    2:"Both"
};

export function returnOption(numOfDays){
    let option = [];
    for(let i = 0; i < numOfDays; i += 1){
        let object = {};
        object["key"] = i;
        if(i <= 1){
            object["text"] = i + " Day";
        } else {
            object["text"] = i + " Days";
        }
        object["value"] = i;
        option.push(object);
    }
    return option;
}

export function returnOptionByArr(arr){
    let option = [];
    for(let item of arr){
        option.push({
            key: item,
            text: item,
            value: item,
        })
    }
    return option;
}


export function nextNDays(year, month, day, n) {
    day += n;
    if (day > datemap[month]) {
        day -= datemap[month];
        month += 1;
    }
    if (month > 12) {
        month = 1;
        year += 1;
    }
    return {year, month, day};
}




export function graphView(object, text="Confirmed Cases "){
    return ( <div>
            <Label>{text}</Label>
            <Chart
                type='bar'
                data={object}
                options={{

                    title:{
                        display:true,
                        text:'Today\'s Confirm Rate',
                        fontSize:20
                    },
                    legend:{
                        display:true,
                        position:'right'
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },


                }}
            />
        </div>
    );
}





export function graphBarView(object){
    return ( <div>
            <Label>Confirmed Cases </Label>
            <Chart
                type='bar'
                data={object}
                options={{

                    title:{
                        display:true,
                        text:'Today\'s Confirm Rate',
                        fontSize:20
                    },
                    legend:{
                        display:true,
                        position:'right'
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },


                }}
            />
        </div>
    );
}

export function getQuarterData(givendata, monthStart, monthEnd){
    let copyGivenData = jsonParseStringify(givendata);
    let outputList = [];
    for(let i = 0; i < givendata.length; i += 1) {
        if((i + 1) >= monthStart){
            if((i + 1) <= monthEnd) {
                outputList.push(givendata[i])
            }
        }
    }
    return jsonParseStringify(outputList);
}

export function returnYearQuarterInMapChart(data2020, data2021, year, quarter) {

    if(quarter === "Whole Year"){
        return [jsonParseStringify(data2020), jsonParseStringify(data2021)];
    }
    let returnDataList = [jsonParseStringify(data2020), jsonParseStringify(data2021)]
    const quarterMap = {
        "Winter": [1, 2],
        "Spring":[3, 5],
        "Summer": [6, 8],
        "Fall": [9, 12],
    }
    if(year === "2020"){
        returnDataList[0] = getQuarterData(data2020, quarterMap[quarter][0], quarterMap[quarter][1]);
    } else if(year === "2021") {
        returnDataList[1] = getQuarterData(data2021, quarterMap[quarter][0], quarterMap[quarter][1]);
    } else {
        returnDataList[0] = getQuarterData(data2020, quarterMap[quarter][0], quarterMap[quarter][1]);
        returnDataList[1] = getQuarterData(data2021, quarterMap[quarter][0], quarterMap[quarter][1]);
    }
    return returnDataList;
}

export function parseData(data, stateName){
    let array = Array(12).fill(0).map(row => new Array(31).fill({}));
    for(let i = 0; i < data.length; i += 1){
        let row = data[i];
        for(let j = 0; j < row.length; j += 1){
            let countiesData = row[j][stateName];
            array[i][j] = jsonParseStringify(countiesData);
        }
    }
    return array;
}

export function stateCountiesData(data2020, data2021, stateName){
    let parsedData2020 = jsonParseStringify(parseData(data2020, stateName)), parsedData2021 = jsonParseStringify(parseData(data2021, stateName));
    return [parsedData2020, parsedData2021];
}
export function nameToObjectList(name){
    let object = {};
    object["name"] = name;
    return [object];
}

export function returnedNewArr(arr){
    // use iqr
    let someArray = jsonParseStringify(arr);
    if(someArray.length < 4)
        return someArray;

    let values, q1, q3, iqr, maxValue, minValue;

    values = someArray.slice().sort( (a, b) => a - b);//copy array fast and sort

    if((values.length / 4) % 1 === 0){//find quartiles
        q1 = 1/2 * (values[(values.length / 4)] + values[(values.length / 4) + 1]);
        q3 = 1/2 * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1]);
    } else {
        q1 = values[Math.floor(values.length / 4 + 1)];
        q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
    }

    iqr = q3 - q1;
    maxValue = q3 + iqr * 1.5;
    minValue = 0;

    let filterArr = arr.map(x=>{if(x >= 0 && x <= maxValue){return x}else{return 1}});




    return filterArr;
}

export function filterOutliers(arr, remove=false) {

    if(!remove){
        return jsonParseStringify(arr);
    }
    let count = 0;
    let returnArr = [], monthDataArr = [];
    for(let i = 0; i < arr.length; i += 1){
        count += 1;
        if(count <= 30){
            monthDataArr.push(arr[i]);
            if(i === arr.length - 1){
                returnArr = jsonParseStringify(returnArr.concat(returnedNewArr(monthDataArr)));
            }
        } else {
            returnArr = jsonParseStringify(returnArr.concat(returnedNewArr(monthDataArr)));
            monthDataArr = [];
            count = 0;
        }
    }

    return returnArr;

}

let monthList = ["January", "February", "March", "April", "May", "June", "July", "August", 'September', 'October', 'November', 'December'];
export function returnFullMonth(){
    return monthList;
}

export function returnRightMonth(startMonth){
    let arr=[], found = false;
    for(let item of monthList){
        if(item === startMonth){
            found = true;
            continue;
        }
        if(found){
            arr.push(item);
        }
    }
    return arr;
}

export function returnFullState(){
    let arr = [];

    for(let subArr of stateFullInitList){
        arr.push(subArr[0]);
    }
    return arr;
}

export function abbrState(input, to){

    var states = [
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

    if (to == 'abbr'){
        input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        for(let i = 0; i < states.length; i++){
            if(states[i][0] == input){
                return(states[i][1]);
            }
        }
    } else if (to == 'name'){
        input = input.toUpperCase();
        for(let i = 0; i < states.length; i++){
            if(states[i][1] == input){
                return(states[i][0]);
            }
        }
    }
}

