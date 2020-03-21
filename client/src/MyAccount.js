import React, { Component } from "react";
import {Card,Form, Button, Col,CardDeck,ListGroup,ListGroupItem} from 'react-bootstrap';
import Web3 from 'web3';
import { Icon } from 'semantic-ui-react';

export default class MyAccount extends Component{
  constructor(props){
     super(props);
     this.state={account:this.props.account,myInfo:this.initialInfo,records:[]};
    
     this.lookUpVoteRecord = this.lookUpVoteRecord.bind(this);

  }
  initialInfo={sharehold:0 ,totalVoteNum:0,voteUsed:0,numOfPeopleNominated:0,voteTime:0};

  // call the voters()


  async componentDidMount(){
    const myInfomation = await this.props.getMyInfo(this.state.account);
    this.setState({myInfo:myInfomation});
  }

  async lookUpVoteRecord(){
    const record = await this.props.lookUpVoteRecord(1);
    this.setState({records:[...this.state.records,record]});
    alert("show record in records:\n candidateId:" + this.state.records[0].candidateID + " Votes: "+ this.state.records[0].voteNum);
  }

 render(){
     return(
        <CardDeck>
        <Card>
        <Card.Header><Icon name='plus square' /> My Stock Info</Card.Header>
          <Card.Body>
          <ListGroup className="list-group-flush">
                <ListGroupItem>Total Stock: {this.state.myInfo.sharehold}</ListGroupItem>
                <ListGroupItem>Total Votes: {this.state.myInfo.totalVoteNum}</ListGroupItem>
                <ListGroupItem>Votes Used: {this.state.myInfo.voteUsed}</ListGroupItem>
                <ListGroupItem>Available Votes: {this.state.myInfo.totalVoteNum - this.state.myInfo.voteUsed}</ListGroupItem>
                <ListGroupItem>Number of Candidates I have voted: {this.state.myInfo.numOfPeopleNominated}</ListGroupItem>
                <ListGroupItem>Remaining Times to Modify My Vote(MAX 3 times): {3 - this.state.myInfo.voteTime}</ListGroupItem>
         </ListGroup>
          </Card.Body>
          <Card.Footer>
          <Button onClick={this.lookUpVoteRecord}  variant="secondary">
                  <Icon name='search' /> Search My Voting History
         </Button>
          </Card.Footer>
        </Card>
        <Card>
        <Card.Header><Icon name='plus square' /> My Voting Records</Card.Header>
          <Card.Body>
          <ListGroup className="list-group-flush">
                
                <ListGroupItem>Vestibulum at eros</ListGroupItem>
         </ListGroup>
          </Card.Body>
          <Card.Footer>
            <small className="text-muted">Last updated 3 mins ago</small>
          </Card.Footer>
        </Card>
      </CardDeck>
     );
 }

}