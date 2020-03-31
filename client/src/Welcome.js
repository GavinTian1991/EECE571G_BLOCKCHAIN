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
                <h1>Group TBD.</h1>
                <p>
                    This voting is {this.state.voteType == 1 ? "Straight Voting." : "Cumulative Coting."}
                </p>
                <p>
                    The number of candidates you can vote to is: {this.state.maxNominateNum}
                </p>
                <h2>
                    Instruction:
                </h2>
                <p>
                    1. Set vote setting and vote start, end date; change vote type under 'Vote Info' tag with deployer authority
                </p>
                <p>
                    2. Create candidates and allocate voter share under 'Vote Setting' tag with deployer authority
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
                    Attention:
                </h2>
                <p>
                    Pay attention to the pop alert window, it will give error or success message related to your operation
                </p>

            </Jumbotron>
        );
    }
}