import React, { Component } from "react";
import {Jumbotron} from 'react-bootstrap';
export default class TestPage extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <Jumbotron>
                <h1>Hello, welcome to D-vote!</h1>
                <p>
                    Please read the instruction before voting ^_^ ~
                </p>

            </Jumbotron>
        );
    }
}