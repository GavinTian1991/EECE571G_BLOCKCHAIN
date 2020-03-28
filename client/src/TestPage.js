import React, { Component } from "react";
import {Jumbotron} from 'react-bootstrap';
export default class TestPage extends Component{
    constructor(props){
        super(props);
        this.state={voteType:1,maxNominateNum:0};
    }

    async componentDidMount(){
        const maxNominateNum = await this.props.getMaxNominatedNum();
        this.setState({maxNominateNum});
        const voteType = await this.props.getVoteType();
        this.setState({voteType});
    }
    render(){
        return(
            <Jumbotron>
                <h1>Group TBD.</h1>
                <h1>Hello, welcome to D-vote!</h1>
                <p>
                    Please read the instruction before voting ^_^ ~
                    Will add briefly instruction here later.
                </p>
                <p>
                    This voting is {this.state.voteType == 1 ? "Straight Voting. " : "Cumulative voting. "}
                </p>
                <p>
                    The number of candidates you can vote to is: {this.state.maxNominateNum}
                </p>
                <p>
                    You can look up your voting records or change your voting in "My Account" page.
                </p>
            </Jumbotron>
        );
    }
}