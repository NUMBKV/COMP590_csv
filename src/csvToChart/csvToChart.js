import React, { Component } from "react";
import {
    attributeList,
    attributeValueList, exampleUrl,
    getJSONFromUrl, isDateHeader, isEmptyObject, isURL,
    processCSV,
    processData,
    returnDropDownOption
} from "./csvUtil";
import {Button, Checkbox, Dropdown, Form, Grid, Header, Label, Message, Modal, Segment} from 'semantic-ui-react';
import {dropDownStateFullNameList, generateSVGMap} from "../usaCounties/usCountiesUtils";
import './csvToChartCSS/csvToChart.css'
import {centeredTitleLogo} from "./csvToChartWidgets";
import { SegmentedControl } from 'segmented-control'
import {
    jsonParseStringify, returnFullMonth, returnFullState,
    returnOption, returnOptionByArr, returnRightMonth,
    searchBarAllInOneFunction,
    searchBarManyChartsFunction
} from "../CountyView/countyViewUtil";
import {loadingWidgets} from "../loadingWidgets/loadingWidgets";
import {SemanticToastContainer, toast} from "react-semantic-toasts";


export default class CsvToChart extends Component{
    constructor(props) {
        super(props);
        this.state = {
            csvURL:'',
            csvFile:'',
            csvArray:[],
            csvLoading: false,
            dataInRow:false,
            attributeList:[],
            attributeValue:"",
            attributeValueOption:[],
            attributeDropDownList:[],
            optionDropDownList:[],
            selection: "url",
            lgDisplay: 3,
            shiftDays: 0,
            movingAverageDays: 0,
            medianFiltersDays: 0,
            split: 'False',
            open: false,
            visible: false,
            exampleState:"",
            removeOutlier: "Remove",
            year:2020,
            monthFrom: "January",
            monthTo: "December"
        }
        this.inputFileRef = React.createRef();
        this.onBtnClick = this.handleBtnClick.bind( this );
    }

    /* Collecting node-element and performing click */
    handleBtnClick() {
        this.inputFileRef.current.click();
    }

    /* Load and process the content of the csv file that the user has uploaded */
    submit(){
        const reader = new FileReader();

        reader.onload = (e)=>{
            const text = e.target.result;
            let processedArray = processCSV(text);

            this.setState({csvArray: processCSV(text), attributeList: attributeList(text), attributeDropDownList: returnDropDownOption(attributeList(text)) });
            console.log(processedArray)
        }
        reader.readAsText(this.state.csvFile);
    }

    /* If the user hasn't uploaded a valid csv file, or entered a valid URL,
       the "Show The Chart" button needs to be disabled and cannot be pressed
     */
    disabledButton(){
        if(this.state.csvFile){
            return false;
        } else if(isURL(this.state.csvURL)){
            return false;
        }
        return true;
    }

    /* Given the attribute value, construct option drop down list and attribute drop down list
    * according to it */
    selectAttributeValue(e, {value}){
        let dropDownList = attributeValueList(this.state.csvArray, value);

        this.state.optionDropDownList = [];

        // if there is no date in the attribute list, needs to deal with it
        if(!isDateHeader(this.state.attributeList)){
          let noDateList = this.state.attributeList.filter(function(ele){
              return ele !== value;
          });
          dropDownList = jsonParseStringify(noDateList);
        }

        dropDownList= dropDownList.filter(function (e){
            return e !== '0.0';
        })
        this.state.optionDropDownList = returnDropDownOption(dropDownList);
        console.log(this.state.optionDropDownList);
        this.setState({
            attributeValue: value,
            optionDropDownList: this.state.optionDropDownList,
            attributeDropDownList: returnDropDownOption(this.state.attributeList),
            attributeValueOption:[],
        });
    }

    /* Set attribute value option according to the given value
    *  If the value is too long, need to set split attribute */
    selectAttributeValueOption(e, {value}){
        if(value.length >= 2){
            this.setState({split: "True"});
        }
        this.setState({attributeValueOption:value})
    }

    /* Set lgDisplay attribute value in state */
    selectGridValue(e, {value}){
       this.setState({lgDisplay: value});
    }

    /* Set shiftDays attribute value in state */
    selectShiftDays(e, {value}){
        this.setState({shiftDays: value});
    }

    /* Set split attribute value in state */
    selectIsSplit(e, {value}){
        if(this.state.attributeValueOption.length >= 2){
            this.setState({split: "True"});
        } else {
            this.setState({split: value});
        }
    }

    /* Set movingAverageDays attribute value in state */
    selectMovingAverageDays(e, {value}){
        this.setState({movingAverageDays: value});
    }

    /* Set medianFiltersDays attribute value in state */
    selectMedianFilterDays(e, {value}){
        this.setState({medianFiltersDays: value});
    }

    /* Set csvURL attribute value in state according to the value of example url */
    selectExamples(e, {value}){
        this.setState({csvURL: exampleUrl(value), exampleState: value});
    }

    /* Set removeOutlier attribute value in state */
    selectRemoveOutliers(e, {value}){
        this.setState({removeOutlier: value})
    }

    /* Set year attribute value in state */
    selectYear(e, {value}){
        this.setState({year: value});
    }

    /* Set monthFrom attribute value in state */
    selectMonthFrom(e, {value}){
        this.setState({monthFrom: value});
    }

    /* Set monthTo attribute value in state */
    selectMonthTo(e, {value}){
        this.setState({monthTo: value});
    }

    /* If need to clear input, the values in state need to be reset */
    clearInput(){
        this.setState({
            attributeValue: "",
            optionDropDownList: [],
            attributeValueOption:[],
        });
    }

    /* Use this function to draw the graph we need
    * First need to check whether the values are all entered,
    * If so, call the searchBarManyChartsFunction function to depict the graph
    * */
    graphWidget(){
       if(this.state.csvArray.length === 0){
        } else if(!this.state.attributeValue) {
            return (
                <div>
                    <Label pointing>
                        Please select the attribute.
                    </Label>

                </div>
            )
        } else if(this.state.attributeValueOption.length === 0) {
            return (
                <div className={"centerDiv"}>
                    <Label pointing>
                        Please select the options.
                    </Label>
                </div>
            )
        } else{ // If the values needed are selected correctly
            let dataObject =  processData(this.state.csvArray, this.state.attributeList, this.state.attributeValue);
            let data2020 = dataObject["2020"], data2021 = dataObject["2021"];
            let selectedList = [];
            for(let i = 0; i < this.state.attributeValueOption.length; i += 1){
                selectedList.push({"name": this.state.attributeValueOption[i]});
            }
            let split = false;
            if(this.state.split === 'True'){
                split = true;
            }
            let removeOutlier = true;
            if(this.state.removeOutlier.toLowerCase() === "keep"){
                removeOutlier = false;
            }

           return(
               <div>
                   <div>
                       {this.simulateOption()}
                   </div>
                   {
                       searchBarManyChartsFunction(
                           data2020,
                           data2021,
                           selectedList,
                           "2020",
                           0,
                           this.state.movingAverageDays,
                           this.state.medianFiltersDays,
                           true,
                           12.0 / this.state.lgDisplay,
                           split,
                           removeOutlier,
                           [this.state.year.toString(), this.state.monthFrom, this.state.monthTo]
                       )
                   }
               </div>
           );
        }
    }

    /* The webpage view for users to upload csv file or enter csv url,
    * Pass the values to state for further use */
    csvUpload(){
        if(localStorage.getItem("selection") === "file"){
            return (
                <div className={"centerDiv"}>
                    <p className={"regularNoBoldCenterClickP"} onClick={this.onBtnClick}>Upload the CSV</p>
                    <input type="file" id = "file" accept=".csv"  ref={this.inputFileRef} style={{display:"none"}} onChange={(e)=>{
                        this.setState({
                            csvFile: e.target.files[0],
                            csvURL: "",
                            csvArray:[],
                            attributeValue: "",
                            optionDropDownList: [],
                            attributeValueOption:[],
                            attributeDropDownList:[],
                        });

                    }

                    }/>
                </div>
            )
        } else if(this.disabledButton() === false && this.state.csvArray.length === 0){
            return (
                <div>
                    {this.popupModals()}
                    <Label pointing>Please click "Show The Chart" button</Label>
                </div>
            );
        } else if(this.disabledButton() === true){
            console.log(returnFullState())
            return (
                <div>
                    <Label pointing>Please enter the valid URL</Label>
                    <Dropdown
                        button
                        options={returnDropDownOption(returnFullState())}
                        search
                        text='Or Try examples'
                        value={""}
                        style = {{"height": "90%"}}
                        onChange = {this.selectExamples.bind(this)}
                    />
                </div>
            );
        }
    }

    /* If the display grid has changed, needs to modify the value
    * Call selectGridValue function to reset the value */
    changeDisplayGrid(){
        let list = [1, 2, 3, 4, 5];
        return (
            <div className={"centerDiv"}>

                <Form.Field
                    control={Dropdown}
                    label='Grid'
                    search selection
                    value = {this.state.lgDisplay}
                    options={returnDropDownOption(list)}
                    placeholder='Value...'
                    onChange = {this.selectGridValue.bind(this)}
                />
            </div>
        );
    }

    /* These are the options that users can choose
    * The first item includes Split and Outliers
    *   For Split, the values users can choose are {True, False}
    *   For Outliers, the values users can choose are {Remove, Keep}
    * The second item includes Median Filters Days and Moving Average Days
    *   For Median Filters Days, the values users can choose are 0 day to 29 days
    *   For Moving Average Days, the values users can choose are 0 day to 29 days
    * The third iterm includes Year, Month From and Month To
    *   For Year, the values users can choose are {2020, 2021}
    *   For Month From, the values users can choose are from January to December
    *   For Month To, the values users can choose are from January to December
    * */
    simulateOption(){
        return (<div>
            <Segment className={"displayInOneRowThreeItems"}>
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Field
                            control={Dropdown}
                            label='Split'
                            search selection
                            value = {this.state.split}
                            options={returnDropDownOption(['False', 'True'])}
                            placeholder='False'
                            onChange = {this.selectIsSplit.bind(this)}
                        />

                        <Form.Field
                            control={Dropdown}
                            label='Outliers'
                            search selection
                            value = {this.state.removeOutlier}
                            options={returnDropDownOption(['Remove', 'Keep'])}
                            placeholder='False'
                            onChange = {this.selectRemoveOutliers.bind(this)}
                        />
                    </Form.Group>
                </Form>
            </Segment>
            <Segment className={"displayInOneRowThreeItems"}>
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Field
                            control={Dropdown}
                            label='Median Filters Days'
                            value = {this.state.medianFiltersDays}
                            search selection
                            options={returnOption(30)}
                            placeholder='Median Filters'
                            onChange = {this.selectMedianFilterDays.bind(this)}
                        />

                        <Form.Field
                            control={Dropdown}
                            label='Moving Average Days'
                            value = {this.state.movingAverageDays}
                            search selection
                            options={returnOption(30)}
                            placeholder='Moving Average Days'
                            onChange = {this.selectMovingAverageDays.bind(this)}
                        />
                    </Form.Group>
                </Form>
            </Segment>
            <Segment className={"displayInOneRowThreeItems"}>
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Field
                            control={Dropdown}
                            label='Year'
                            search selection
                            value = {this.state.year}
                            options={returnDropDownOption([2020, 2021])}
                            placeholder='None'
                            onChange = {this.selectYear.bind(this)}
                        />

                        <Form.Field
                            control={Dropdown}
                            label='Month from'
                            search selection
                            value = {this.state.monthFrom}
                            options={returnDropDownOption(returnFullMonth())}
                            placeholder='None'
                            onChange = {this.selectMonthFrom.bind(this)}
                        />

                        <Form.Field
                            control={Dropdown}
                            label='Month to'
                            value = {this.state.monthTo}
                            search selection
                            options={returnDropDownOption(returnRightMonth(this.state.monthFrom))}
                            placeholder='None'
                            onChange = {this.selectMonthTo.bind(this)}
                        />
                    </Form.Group>
                </Form>
            </Segment>
        </div>)
    }

    /* Set open attribute value in state */
    setOpen(value){
        this.setState({open: value});
    }

    /* The view that will appear upon selecting some values */
    popupModals(){
        console.log(1);
        if(this.state.exampleState !== ""){
            setTimeout(() => {
                toast({
                    type: 'success',
                    icon: 'envelope',
                    title: `${this.state.exampleState} was selected`,
                    time: 1500
                });
            }, 500);
            return (
                <div>
                    <SemanticToastContainer className="container" maxToasts={1}/>
                </div>
            );
        } else {
            return <div></div>
        }
    }

    /* This function is used to render the whole page
    * Besides the logos and the field to enter URL,
    * there are drop down lists for x-axis, y-axis and grid for users to choose
    */
    render(){
        if(this.state.csvLoading){
            return (
                <div>
                    {loadingWidgets()}
                </div>
            );
        }
        return (
            <div>
                {centeredTitleLogo()}
                <div>
                    {/*<Button basic color='blue' as="label" htmlFor="file" type="button">*/}
                    {/*    Upload The CSV*/}
                    {/*</Button>*/}
                    {/*<input type="file" id = "file" accept=".csv"  ref={this.inputFileRef} style={{display:"none"}} onChange={(e)=>{this.setState({csvFile: e.target.files[0]})}}/>*/}
                    {/*<Checkbox label='Attribute "Date" in Row' value = {this.state.dataInRow} onChange = {(event, data)=>{*/}
                    {/*    this.setState({dataInRow: data.checked});*/}
                    {/*}}/>*/}
                </div>
                <br/><br/><br/>
                <div>
                    <Grid columns='equal' centered columns={2}>
                        <Segment style={{"width":900}}>
                            <p className={"LargeBoldCenterP"} >Paste the URL to be visualized</p>
                            <div className={"displayInRowCenter"}>
                                <Form style={{"width":500}}>
                                    <Form.Field>
                                        <input value = {this.state.csvURL} onChange={(e)=>{
                                            this.setState({csvURL: e.target.value, csvFile: null})}
                                        }/>
                                    </Form.Field>
                                </Form>
                                <Button basic color='blue' type="button" disabled={this.disabledButton()} onClick={async (e) => {
                                    e.preventDefault();
                                    let result;
                                    let getJSONFromURL = false;
                                    if (this.state.csvURL) {
                                        this.setState({csvLoading: true});
                                        result = await getJSONFromUrl(this.state.csvURL);
                                        if(result !== "error"){
                                            getJSONFromURL = true;
                                            this.setState({
                                                csvFile: null,
                                                csvLoading: false,
                                                attributeList: result[0][0],
                                                attributeDropDownList: returnDropDownOption(result[0][0]),
                                                csvArray: result[0][1],
                                                attributeValue: "",
                                                optionDropDownList: [],
                                                attributeValueOption:[],
                                            })
                                        }
                                    }

                                    if (getJSONFromURL === false && this.state.csvFile) {
                                        console.log(123);
                                        this.submit();
                                    }
                                }}> Show The Chart</Button>

                            </div>
                            <div>
                                <br/>
                                {this.csvUpload()}
                            </div>

                        </Segment>
                    </Grid>
                </div>

                <br/>

                <Segment>
                    <Form>
                        <Form.Group widths='equal'>
                            <Form.Field
                                control={Dropdown}
                                label='Attribute (x-axis)'
                                search selection
                                value = {this.state.attributeValue}
                                options={this.state.attributeDropDownList}
                                placeholder='Attribute value...'
                                onChange = {this.selectAttributeValue.bind(this)}
                            />

                            <Form.Field
                                control={Dropdown}
                                label='Options (y-axis)'
                                fluid multiple search selection
                                value = {this.state.attributeValueOption}
                                options={this.state.optionDropDownList}
                                placeholder=''
                                onChange = {this.selectAttributeValueOption.bind(this)}
                            />
                            .
                            <Form.Field
                                control={Dropdown}
                                label='Grid'
                                search selection
                                value = {this.state.lgDisplay}
                                options={returnDropDownOption([1,2,3,4,5])}
                                placeholder='Value...'
                                onChange = {this.selectGridValue.bind(this)}
                            />
                        </Form.Group>
                    </Form>
                </Segment>

                <div>
                    {this.graphWidget()}
                </div>

            </div>
        )
    }
}

