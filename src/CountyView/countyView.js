import React, { Component } from "react";
import axios from 'axios';
import {
    abbrState,
    countyNameListToSearchBarOption, dropDownOptionValueTo, dropDownSearchOption,
    isEmpty, jsonParseStringify,
    multipleStyle, nameToObjectList,
    objectKeyArray, pureList, returnOption, returnYearQuarterInMapChart,
    searchBarAllInOneFunction, searchBarManyChartsFunction, stateCountiesData
} from "./countyViewUtil";
import {
    Dimmer,
    Loader,
    Image,
    Segment,
    Menu,
    Dropdown,
    Header,
    Button,
    Form,
    Input,
    Select,
    Modal, TransitionablePortal, Checkbox
} from 'semantic-ui-react'
import { SVGMap, Taiwan, RadioSVGMap } from 'react-svg-map';
import Multiselect from 'multiselect-react-dropdown';
import {backendTo} from "../backend/backendUtils";
import {USACounties} from "../usaCounties/usaCounties";
import '../examples-app.scss.css';
import {texasCounties} from "../usaCounties/texasCounties";
import {
    dropDownStateFullNameList,
    generateSVGMap,
    parseCountyList,
    returnFullNameList
} from "../usaCounties/usCountiesUtils";
const usaCounties  = USACounties();
const texasMap = texasCounties();
export function getLocationName(event) {
    return event.target.attributes.name.value;
}


export default class CountyView  extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,

            countyList: [],
            mapToCountyList:{},
            data_2021: Array(12).fill(0).map(row => new Array(31).fill({})),
            data_2020: Array(12).fill(0).map(row => new Array(31).fill({})),




            data_2021AllCounties:Array(12).fill(0).map(row => new Array(31).fill({})),
            data_2020AllCounties:Array(12).fill(0).map(row => new Array(31).fill({})),

            dataObject:{},

            selectedValue:[],
            selectedCountyList:[],
            selectText:"",
            selectYearInSearch:0,
            selectYearInModal:0,
            selectQuarterInModal:"Whole Year",
            chartButton: '',
            mapButton:'blue',
            oneChartButton: '',
            manyChartsButton: '',
            simulateButton:'',
            shiftDays:0,
            movingAverageDays:0,
            medianFiltersDays:0,
            selectedStateInMapView:"TX",
            selectedObjectInMapView: texasMap,
            countyMapModalOpen:false,
            selectCountyName:"",
            errorMessageOpen: false,
            selectedCountyState:"",
            showUsaMap:false,
            showUsaMapDataObject:{},

            stateCountyDataMap:{},
        }
        //onSelect
        this.onSelect = this.onSelect.bind(this);
        //onRemove
        this.onRemove = this.onRemove.bind(this);
        this.handleLocationMouseOver = this.handleLocationMouseOver.bind(this);
        this.handleLocationMouseOut = this.handleLocationMouseOut.bind(this);
        this.handleLocationMouseMove = this.handleLocationMouseMove.bind(this);
        this.handleOnLocationClick = this.handleOnLocationClick.bind(this);

    }

    handleLocationMouseOver(event) {
        const pointedLocation = getLocationName(event);
        this.setState({ pointedLocation });
    }

    handleLocationMouseOut() {
        this.setState({ pointedLocation: null, tooltipStyle: { display: 'block' } });
    }

    handleLocationMouseMove(event) {
        const tooltipStyle = {


            display: 'block',
            top: event.clientY + 10,
            left: event.clientX - 100
        };
        this.setState({ tooltipStyle });
    }

    setCountyMapModal(open){
        this.setState({countyMapModalOpen: open})
    }

    async handleOnLocationClick(event) {
        let county = this.state.pointedLocation.toString().split(",")[0];
        let state = abbrState(this.state.pointedLocation.toString().split(",")[1].replace(/\s+/g, ""), "name");

        let found_county = false;
        let dataObject = this.state.dataObject;
        let countyList = this.state.mapToCountyList[state];

        if(this.state.showUsaMap){
            if(this.state.selectedStateInMapView === abbrState(state, "abbr")){
                this.state.showUsaMapDataObject = jsonParseStringify(this.state.dataObject);
            } else {
                let object = await this.fetchDataByState(state);
                this.state.showUsaMapDataObject = jsonParseStringify(object);
            }
            found_county = true;
            this.setState({showUsaMapDataObject: this.state.showUsaMapDataObject});
        } else {
            for (let i = 0; i < this.state.data_2020.length; i += 1) {
                for (let j = 0; j < this.state.data_2020[i].length; j += 1) {
                    if (this.state.data_2020[i][j][county]) {
                        found_county = true;
                        break;
                    }
                }
            }


            if(dataObject[state]){
                found_county = true;
            }


            if (this.state.dataObject[state]) {
                console.log(this.state.dataObject[state]);
            }

            if (found_county) {
                console.log("find")
            } else {

                console.log("not find")

            }
        }



        this.setState({
            countyMapModalOpen: true,
            selectCountyName: this.state.pointedLocation.toString(),
            errorMessageOpen: !found_county,

        })
        console.log(this.state.pointedLocation)
    }

    getLocationClassName(location, index) {
        // Generate random heat map
        // console.log(location.name)
        return `fillColorHeat${index % 4}`;
    }


    async componentDidMount() {
        await axios.get(backendTo('fetchAllData'))
            .then(res => {
                let responseData = res.data;
                console.log(responseData);
                this.state.data_2020 = responseData["data2020"];
                this.state.data_2021 = responseData["data2021"];
                for (let i = 0; i < this.state.data_2020.length; i += 1) {
                    let currentValue = this.state.data_2020[i];
                    for (let j = 0; j < currentValue.length; j += 1) {
                        if (isEmpty(currentValue[j]) === false) {
                            let countyList = Object.keys(currentValue[j]);
                            if (countyList.length >= 1) {
                                let index = countyList.indexOf("Date");
                                if (index > -1) {
                                    countyList.splice(index, 1);
                                }
                                this.state.countyList = countyList;
                                this.setState({countyList: this.state.countyList});
                                break;
                            }

                        }
                    }
                }
                let dataObject = {};
                dataObject["data_2020"] = this.state.data_2020;
                dataObject["data_2021"] = this.state.data_2021;

                this.state.dataObject["Texas"] = jsonParseStringify(dataObject);
                this.state.loading = false;
                this.setState({loading: false});

                this.setState({
                    data_2020: this.state.data_2020,
                    data_2021: this.state.data_2021,
                    loading: this.state.loading,
                    dataObject: this.state.dataObject,
                });
            })
    }

    async fetchDataByState(stateName){
        this.setState({loading: true});
        let returnObject = {};
        await axios.get(backendTo(`fetchStateData/${stateName}`)).then(res=>{
            let responseData = res.data;
            returnObject = responseData;
        })
        this.setState({loading:false})
        return returnObject;
    }

    async fetchDataByStateCounty(stateName, countyName){
        this.setState({loading: true});
        let returnObject = {};
        await axios.get(backendTo(`fetchStateData/${stateName}+${countyName}`)).then(res=>{
            let responseData = res.data;
            returnObject = responseData;
        })
        this.setState({loading:false})
        return returnObject;
    }


    onSelect(selectedList, selectedItem) {
        if(selectedList && selectedList.length >= 1) {

            this.state.selectText = "Backspace to remove ";
        } else {
            this.state.selectText = "Select...";
        }
        this.setState({selectText: this.state.selectText, selectedCountyList: selectedList})
    }

    onRemove(selectedList, removedItem) {
        if(selectedList && selectedList.length >= 1) {
            this.state.selectText = "Backspace to remove ";
        } else {
            this.state.selectText = "Select...";
        }
        this.setState({selectText: this.state.selectText, selectedCountyList: selectedList})
    }

    selectShiftDays(e, {value}){
        this.setState({shiftDays: value});

    }

    async selecteStateInMapView(e, {value}){
        let object = generateSVGMap(value);
        let fullStateName = abbrState(value, 'name');

        let dataObject = this.state.dataObject;
        let countyList = this.state.countyList;

        if(dataObject[fullStateName]){
            console.log(dataObject[fullStateName]);
        } else{
            let returnObject = await this.fetchDataByState(fullStateName);
            let dataMap = {};
            dataMap["data_2020"] = returnObject.requestData2020;
            dataMap["data_2021"] = returnObject.requestData2021;
            dataObject[fullStateName] = dataMap;
            countyList = parseCountyList(dataMap["data_2021"])
        }



        //await this.fetchDataByState(fullStateName);
        this.setState({
            selectedStateInMapView: value,
            selectedObjectInMapView: object,
            dataObject:dataObject,
            data_2020:  dataObject[fullStateName]["data_2020"] ,
            data_2021: dataObject[fullStateName]["data_2021"],
            showUsaMap: false,
            countyList: countyList,
        })

    }

    selectMovingAverageDays(e, {value}){
        this.setState({movingAverageDays:value});

    }

    selectMedianFilterDays(e, {value}){
        this.setState({medianFiltersDays:value})

    }


    countyMapView(){
        return (
            <div>
                <Form.Group widths='equal'>
                    <Form.Field
                        control={Dropdown}
                        search selection
                        value = {this.state.selectedStateInMapView}
                        options={dropDownStateFullNameList()}
                        onChange = {this.selecteStateInMapView.bind(this)}
                    />
                    <Checkbox label='Show USA Map' value = {this.state.showUsaMap} onChange = {(event, data)=>{
                       let defaultObjectView = texasMap;

                       if(data.checked){
                           defaultObjectView = usaCounties;
                       } else{
                           defaultObjectView = generateSVGMap(this.state.selectedStateInMapView);
                       }



                       this.setState({selectedObjectInMapView: defaultObjectView, showUsaMap: data.checked});


                    }}/>

                </Form.Group>

                <div className="CountyMap">
                    <SVGMap
                        map={this.state.selectedObjectInMapView}
                        locationClassName={this.getLocationClassName}
                        onLocationMouseOver={this.handleLocationMouseOver}
                        onLocationMouseOut={this.handleLocationMouseOut}
                        onLocationMouseMove={this.handleLocationMouseMove}
                        onLocationClick = {this.handleOnLocationClick}
                    />
                </div>
                <div className="examples" style={this.state.tooltipStyle}>
                    {this.state.pointedLocation}
                </div>
            </div>
        );
    }

    simulateOption(){
        if(this.state.manyChartsButton === "blue" && this.state.simulateButton === "blue"){
            return (<div>
                <Segment>
                    <Form>
                        <Form.Group widths='equal'>
                            <Form.Field
                                control={Dropdown}
                                label='Shift Days'
                                search selection
                                value = {this.state.shiftDays}
                                options={returnOption(10)}
                                placeholder='Shift Days'
                                onChange = {this.selectShiftDays.bind(this)}
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
                            <Form.Field
                                control={Dropdown}
                                label='Median Filters Days'
                                value = {this.state.medianFiltersDays}
                                search selection
                                options={returnOption(30)}
                                placeholder='Median Filters'
                                onChange = {this.selectMedianFilterDays.bind(this)}
                            />
                        </Form.Group>
                    </Form>
                </Segment>
            </div>)
        }
    }
    viewReturn(){
        if(this.state.oneChartButton === "blue"){
            return  searchBarAllInOneFunction(jsonParseStringify(this.state.data_2020),jsonParseStringify(this.state.data_2021), jsonParseStringify(this.state.selectedCountyList), dropDownOptionValueTo[this.state.selectYearInSearch]);
        } else if(this.state.manyChartsButton === "blue") {
            return (
                <div>
                    {this.simulateOption()}
                    <Menu compact style = {{position: 'absolute',
                        right: "50px",}}>
                        <Dropdown value = {this.state.selectYearInSearch} options={dropDownSearchOption}  onChange={(event, {value})=>{
                            this.setState({selectYearInSearch: value});
                            console.log(dropDownOptionValueTo[value])
                        }} simple item />
                    </Menu>
                    {searchBarManyChartsFunction(
                        jsonParseStringify(this.state.data_2020),
                        jsonParseStringify(this.state.data_2021),
                        jsonParseStringify(this.state.selectedCountyList),
                        dropDownOptionValueTo[this.state.selectYearInSearch],
                        this.state.shiftDays,
                        this.state.movingAverageDays,
                        this.state.medianFiltersDays,
                    )}

                </div>
            );
        }
    }
    simulateButtonReturn(){
        if(this.state.manyChartsButton === "blue"){
            return (<Button basic color = {this.state.simulateButton} onClick={()=>{this.switchViewOnClick(3)}}>Analyze</Button>);
        }
    }
    displayButton(){
        if(this.state.chartButton === 'blue' || this.state.mapButton === 'blue') {
            return(
                <div>

                    <Button basic color= {this.state.mapButton} onClick={()=>this.switchViewOnClick(-1)}>Map View</Button>
                    <Button basic color = {this.state.chartButton} onClick={()=>this.switchViewOnClick(1)}>Chart View</Button>

                </div>
            );
        } else if(this.state.manyChartsButton === 'blue' || this.state.simulateButton === 'blue' || this.state.oneChartButton  === 'blue'){
            return (
                <div>

                    <Button labelPosition='left' icon='left chevron' content='Back' onClick={()=>{this.switchViewOnClick(-1)}}/>
                    <Button basic color= {this.state.oneChartButton} onClick={()=>this.switchViewOnClick(1)}>All In One</Button>
                    <Button basic color = {this.state.manyChartsButton} onClick={()=>this.switchViewOnClick(2)}>Split Views</Button>
                    {this.simulateButtonReturn()}

                </div>
            );
        }
    }

    sectionDisplay(){
        if(this.state.chartButton === "blue" || this.state.mapButton === "blue") {
            return (
                <div>
                    {this.countyMapView()}
                    {this.mapCountyModal()}

                </div>)
        } else if(this.state.manyChartsButton === 'blue' || this.state.simulateButton === 'blue' || this.state.oneChartButton  === 'blue') {
            return(
                <div>
                    <Multiselect
                        options={countyNameListToSearchBarOption(this.state.countyList)} // Options to display in the dropdown
                        selectedValues={this.state.selectedValue} // Preselected value to persist in dropdown
                        onSelect={this.onSelect} // Function will trigger on select event
                        onRemove={this.onRemove} // Function will trigger on remove event
                        displayValue="name"
                        showCheckbox ={true}
                        placeholder = {this.state.selectText}// Property name to display in the dropdown options
                        style={multipleStyle}
                    />
                    <Menu compact style = {{position: 'absolute',
                        right: "50px",}}>
                        <Dropdown value = {this.state.selectYearInSearch} options={dropDownSearchOption}  onChange={(event, {value})=>{
                            this.setState({selectYearInSearch: value});
                            console.log(dropDownOptionValueTo[value])
                        }} simple item />
                    </Menu>
                    {this.viewReturn()}
                </div>
            )
        }
    }

    mainSearchView(){

        return (

            <div style={{marginLeft: "50px", marginRight: "50px"}}>
                <br/>
                <br/>

                <Header as='h3' textAlign='center'>
                    {abbrState(this.state.selectedStateInMapView, 'name') + " County View"}
                </Header>
                <Header as='h3' textAlign='center'>
                    <Button.Group basic>
                        {this.displayButton()}
                    </Button.Group>
                </Header>

                <br/>
                <br/>

                {this.sectionDisplay()}


            </div>
        );
    }

    countyMapChartView(countyName){
        let copyData2020 = jsonParseStringify(this.state.data_2020), copyData2021 = jsonParseStringify(this.state.data_2021);

        if(this.state.showUsaMap){
          if(JSON.stringify(this.state.showUsaMapDataObject) === '{}'){
          } else{
              copyData2020 = jsonParseStringify(this.state.showUsaMapDataObject["requestData2020"])
              copyData2021 = jsonParseStringify(this.state.showUsaMapDataObject["requestData2021"])
          }
        }

        let nameList =  nameToObjectList(countyName), dropDownValue = dropDownOptionValueTo[this.state.selectYearInModal], dropDownQuarter = this.state.selectQuarterInModal;
        let dataList = returnYearQuarterInMapChart(copyData2020, copyData2021, dropDownValue, dropDownQuarter);
        // console.log(dataList)

        return (
            <div>
                <Menu compact style = {{position: 'absolute',
                    right: "150px",}}>
                    <Dropdown value = {this.state.selectYearInModal} options={dropDownSearchOption}  onChange={(event, {value})=>{
                        this.setState({selectYearInModal: value});
                    }} simple item />
                </Menu>
                <Menu compact style = {{position: 'absolute',
                    right: "10px",}}>
                    <Dropdown value = {this.state.selectQuarterInModal} options={[ {text: "Winter", value: 'Winter'}, { text: 'Spring', value: 'Spring' }, {text: "Summer", value: "Summer"}, { text: 'Fall', value: 'Fall' }, {text: 'Whole Year', value: 'Whole Year'}]}  onChange={(event, {value})=>{
                        this.setState({selectQuarterInModal: value});

                    }} simple item />
                </Menu>
                {searchBarAllInOneFunction(dataList[0], dataList[1], nameList, dropDownValue )}
            </div>
        )
    }

    switchViewOnClick(input){
        if(input === 1) {
            this.state.oneChartButton = 'blue';
            this.state.manyChartsButton = '';
            this.state.mapButton = '';
            this.state.chartButton = '';

        } else if(input === 2){
            this.state.oneChartButton = '';
            this.state.manyChartsButton = 'blue';

        } else if(input === 3){
            if(this.state.simulateButton === "blue"){
                this.state.simulateButton = '';
            } else {
                this.state.simulateButton = 'blue';
            }
        } else if(input === -1){
            this.state.mapButton = 'blue';
            this.state.chartButton = '';
            this.state.manyChartsButton = '';
            this.state.oneChartButton = '';
        } else if(input === 0){
            this.state.mapButton = '';
            this.state.chartButton = '';
            this.state.manyChartsButton = '';
            this.state.oneChartButton = 'blue';
        }
        this.setState({manyChartsButton: this.state.manyChartsButton,
            oneChartButton: this.state.oneChartButton,
            simulateButton: this.state.simulateButton,
            mapButton: this.state.mapButton,
            chartButton: this.state.chartButton,
        });
    }

    mapCountyModal(){
        if(this.state.errorMessageOpen){
            return(
                <Modal
                    onClose={() => this.setCountyMapModal(false)}
                    onOpen={() => this.setCountyMapModal(true)}
                    open={this.state.countyMapModalOpen}
                >
                    <Modal.Header>
                        {"County data is not available"}
                    </Modal.Header>

                    <Modal.Content>
                        {"Sorry, the county data will be available soon"}
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            content="Close"
                            labelPosition='right'
                            icon='checkmark'
                            onClick={() => this.setCountyMapModal(false)}
                            positive
                        />
                    </Modal.Actions>
                </Modal>
            );
        }
        return (
            <Modal
                onClose={() => this.setCountyMapModal(false)}
                onOpen={() => this.setCountyMapModal(true)}
                open={this.state.countyMapModalOpen}
                size = {"large"}
            >
                <Modal.Header>
                    {this.state.selectCountyName}
                </Modal.Header>

                <Modal.Content>
                    {this.countyMapChartView(this.state.selectCountyName.split(",")[0])}
                </Modal.Content>
                <Modal.Actions>
                    <Button color='black' onClick={() => this.setCountyMapModal(false)}>
                        Suggestions
                    </Button>
                    <Button
                        content="Yep, that's great"
                        labelPosition='right'
                        icon='checkmark'
                        onClick={() => this.setCountyMapModal(false)}
                        positive
                    />
                </Modal.Actions>
            </Modal>
        );
    }

    render() {
        if (this.state.loading) {
            return (
                <Segment>
                    <Dimmer active inverted>
                        <Loader size='large'>Loading</Loader>
                    </Dimmer>

                    <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png'/>
                    <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png'/>
                    <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png'/>
                    <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png'/>
                    <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png'/>
                    <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png'/>

                </Segment>
            );
        } else {
            return(
                <div>

                    {this.mainSearchView()}
                </div>
            );

        }

    }

}