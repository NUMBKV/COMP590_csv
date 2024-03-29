import React, { Component } from "react";
import {Button, Header, Modal} from "semantic-ui-react";
import {FILE, SELECTED, selectionMapValue, UNSELECTED} from "./constValuesUtils";
import CsvToChart from "../csvToChart/csvToChart";

/*
The CsvWeb component is the initial interface of csv visualization, providing users with a pop-up window;
users can choose to make their own visualization according to url or file.
*/

export default class CsvWeb  extends Component{
    constructor(props) {
        super(props);
        this.state = {
            open: true,
            urlOnButton: UNSELECTED,
            fileOnButton: UNSELECTED,
            selectionValue:"url",
        }
    }

    render() {
        let value = this.state.selectionValue;
        return(
            <div>
                {this.showModal()}
                <CsvToChart name = {value}/>
            </div>
        );
    }

    //pop-up window that can choose the visualization type
    showModal(){
        return (<div>
            <Modal
                closeOnDimmerClick = {false}
                open={this.state.open}
            >
                <Modal.Header>CSV Visualization</Modal.Header>
                <Modal.Content >
                    <Modal.Description>
                        <Header>Please make a selection</Header>
                        <Button basic = {this.state.urlOnButton} color='green' onClick={()=>{this.setUrlFileButton(SELECTED, UNSELECTED)}}>
                            Visualization by Url
                        </Button>
                        <Button basic = {this.state.fileOnButton} color='blue' onClick={()=>{this.setUrlFileButton(UNSELECTED, SELECTED)}}>
                            Visualization by File
                        </Button>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>

                    <Button
                        content="Continue"
                        labelPosition='right'
                        icon='checkmark'
                        disabled={this.disableContinueButton()}
                        onClick={() => this.closeModal()}
                        color= {this.continueButtonColor()}
                    />
                </Modal.Actions>
            </Modal>
        </div>);
    }


    //choose the visualization type
    setUrlFileButton(url, file){
        let value = "url";
        if(file === SELECTED){
            value = "file";
        }
        localStorage.removeItem("selection");
        localStorage.setItem("selection", value);

        this.setState({urlOnButton: url, fileOnButton: file});
    }

    //close the window
    closeModal(){
        if(this.state.urlOnButton === SELECTED || this.state.fileOnButton === SELECTED){
            this.setState({open: false});
        }
    }

    continueButtonColor(){
        if(this.state.urlOnButton === SELECTED){
            return "green";
        } else if(this.state.fileOnButton === SELECTED){
            return "blue";
        } else{
            return "";
        }
    }

    disableContinueButton(){
        if(this.state.urlOnButton === UNSELECTED && this.state.fileOnButton === UNSELECTED){
            return true;
        } else {
            return false;
        }
    }

}