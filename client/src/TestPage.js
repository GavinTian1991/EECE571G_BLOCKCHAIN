import React, { Component } from "react";
import {Jumbotron,Button} from 'react-bootstrap';
import DatePicker from 'react-date-picker';
export default class TestPage extends Component{
    constructor(props){
        super(props);
        this.state={voteType:1,maxNominateNum:0, date_id:0,
            dateSettingStart:new Date(),
            dateSettingEnd:new Date(),
            dateVoteStart:new Date(),
            dateVoteEnd:new Date(),
            voteSettingStartDate: "",
            voteSettingEndDate: "",
            voteStartDate: "",
            voteEndDate: "",
            isDeployer:false};
        this.onSettingStartChange =this.onSettingStartChange.bind(this);
        this.onSettingEndChange = this.onSettingEndChange.bind(this);
        this.onVoteStartChange = this.onVoteStartChange.bind(this);
        this.onVoteEndChange =this.onVoteEndChange.bind(this);
        this.checkVoteSettingDate = this.checkVoteSettingDate.bind(this);
        this.checkVoteDate =this.checkVoteDate.bind(this);
        this.reSetStartEndDate = this.reSetStartEndDate.bind(this);
    }

    async componentDidMount() {
        const maxNominateNum = await this.props.getMaxNominatedNum();
        this.setState({maxNominateNum});
        const voteType = await this.props.getVoteType();
        this.setState({voteType});
        const isDeployer=await this.props.isDeployer();
        this.setState({isDeployer});
        this.setState({
            voteSettingStartDate: this.dateToString(this.props.voteSettingStartDate),
            voteSettingEndDate: this.dateToString(this.props.voteSettingEndDate),
            voteStartDate: this.dateToString(this.props.voteStartDate),
            voteEndDate: this.dateToString(this.props.voteEndDate)
        });
        console.log(this.state.voteEndDate);
    }

    dateToString=(_date)=>{
        //console.log(_date);
        return _date.getDate() + "/" +(_date.getMonth() + 1) + "/" + _date.getFullYear();
    }

    onSettingStartChange=(date)=>{
        this.props.setVoteSettingStartDate(date);
        this.setState({dateSettingStart:date});
    }
    onSettingEndChange=(date)=>{
          this.props.setVoteSettingEndDate(date);
          this.setState({dateSettingEnd:date});
    }
    onVoteStartChange=(date)=>{
          this.props.setVoteStartDate(date);
          this.setState({dateVoteStart:date});
    }
    onVoteEndChange=(date)=>{
          this.props.setVoteEndDate(date);
          this.setState({dateVoteEnd:date});
    }
    checkVoteSettingDate(){
          this.props.checkVoteSettingDate(0);
    }
    checkVoteDate(){
          this.props.checkVoteDate(0);
    }
    reSetStartEndDate() {
        this.props.setStartEndDate(0, new Date().getFullYear(), 
        new Date().getMonth(), 
        new Date().getDate());
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

                {/* <p>
                    Current valid vote setting period: {this.state.voteSettingStartDate.getDate()}
                </p> */}
                
                <p>
                    Current valid vote setting period: {this.state.voteSettingStartDate} ~ {this.state.voteSettingEndDate}
                </p>
                <p>
                    Current valid vote period: {this.state.voteStartDate} ~ {this.state.voteEndDate}
                </p>
                {this.state.isDeployer ? <div style={{margin: '20px'}}>
                    <div> Please select vote setting start date: 
                    <DatePicker
                    onChange={this.onSettingStartChange}
                    value={this.state.dateSettingStart}
                    />
                </div>
                <div> Please select vote setting end date: 
                    <DatePicker
                    onChange={this.onSettingEndChange}
                    value={this.state.dateSettingEnd}
                    />
                </div>
                <div> Please select vote start date: 
                    <DatePicker
                    onChange={this.onVoteStartChange}
                    value={this.state.dateVoteStart}
                    />
                </div>
                <div>  Please select vote end date: 
                    <DatePicker
                    onChange={this.onVoteEndChange}
                    value={this.state.dateVoteEnd}
                    />
                </div>
                </div> : <div></div>
                    }
                <div style={{margin: '20px'}}>
                <p>
                    <Button variant="primary" onClick={this.reSetStartEndDate}>Reset all start and end date.</Button>
                </p>
                <p>
                    <Button variant="primary" onClick={this.checkVoteSettingDate}>Can I change vote setting today?</Button>
                </p>
                <p>
                    <Button variant="primary" onClick={this.checkVoteDate}>Can I vote today?</Button>
                </p>
                </div>
            </Jumbotron>
        );
    }
}