import React, { Component } from "react";
import {Jumbotron} from 'react-bootstrap';
export default class Welcome extends Component{

    constructor(props){
        super(props);
        this.state={voteType:1, maxNominateNum:0}
    }

    async componentDidMount() {
        const maxNominateNum = await this.props.getMaxNominatedNum();
        this.setState({maxNominateNum});
        const voteType = await this.props.getVoteType();
        this.setState({voteType});
    }
    render(){
        return(
            <Jumbotron>
                <h2>
                    Instruction
                </h2>
                <p>
                    1. Set vote setting and vote start, end date under 'Vote Info' tag with deployer authority
                </p>
                <p>
                    2. Create candidates; allocate voter share and change vote type under 'Vote Setting' tag with deployer authority
                </p>
                <p>
                    3. Vote for candidates under 'Vote' tag, select votes number if under vote type 2 Cumulative Voting
                </p>
                <p>
                    4. View your current shares and votes information; votes history and modify your votes (MAX 3 times) under 'My Account' tag
                </p>
                <p>
                    5. View vote results under 'Results' tag
                </p>
                <h2>
                    Attention
                </h2>
                <p>
                    Pay attention to the pop alert window, it will give error or success message related to your operation
                </p>
                <h2>
                    About
                </h2>
                <a href="https://en.wikipedia.org/wiki/Straight-ticket_voting" target="_blank" rel="noopener noreferrer">Straight Voting</a>
                <p> </p>
                <a href="https://en.wikipedia.org/wiki/Cumulative_voting" target="_blank" rel="noopener noreferrer">Cumulative Voting</a>
                <p> </p>
                <p>Group TBD. Copyright 2020</p>
            </Jumbotron>
        );
    }
}