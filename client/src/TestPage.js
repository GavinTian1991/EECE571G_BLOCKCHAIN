import React, { Component } from "react";
import {Jumbotron} from 'react-bootstrap';
export default class TestPage extends Component{
    render(){
        return(
            <Jumbotron>
                <h1>Group TBD.</h1>
                <h1>Hello, welcome to D-vote!</h1>
                <p>
                    Please read the instruction before voting ^_^ ~
                    Will add briefly instruction here later.
                </p>
            </Jumbotron>
        );
    }
}