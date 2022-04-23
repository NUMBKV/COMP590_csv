import {Dimmer, Image, Loader, Segment} from "semantic-ui-react";
import React from "react";

export function loadingWidgets(){
    return(<div>
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
    </div>)
}