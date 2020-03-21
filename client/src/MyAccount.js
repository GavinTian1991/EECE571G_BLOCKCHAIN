import React, { Component } from "react";
import {Card,Form, Button, Table,CardDeck,ListGroup,ListGroupItem} from 'react-bootstrap';
import Web3 from 'web3';
import { Icon } from 'semantic-ui-react';

export default class MyAccount extends Component{
  constructor(props){
     super(props);
     this.state={account:this.props.account,myInfo:this.initialInfo,record:this.initialRecord};
    
     this.lookUpVoteRecord = this.lookUpVoteRecord.bind(this);

  }
  initialInfo={stock:0 ,totalVoteNum:0,voteUsed:0,numOfPeopleNominated:0,voteTime:0};
  initialRecord={myAddr:"",recordID:[],candidateID:[],voteNum:[]};
  // call the voters()


  async componentDidMount(){
    const myInfomation = await this.props.getMyInfo(this.state.account);
    this.setState({myInfo:myInfomation});
  }

  async lookUpVoteRecord(){
    const record = await this.props.lookUpVoteRecord();
    await this.setState({record});
   //alert("show record in records:\n candidateId:" + record.myAddr + " Votes: "+ record.voteNum[0]);
  }

 render(){
     return(
        <CardDeck>
        <Card>
        <Card.Header><Icon name='plus square' /> My Stock Info</Card.Header>
          <Card.Body>
          <ListGroup className="list-group-flush">
                <ListGroupItem>Total Stock: {this.state.myInfo.stock}</ListGroupItem>
                <ListGroupItem>Total Votes: {this.state.myInfo.totalVoteNum}</ListGroupItem>
                <ListGroupItem>Votes Used: {this.state.myInfo.voteUsed}</ListGroupItem>
                <ListGroupItem>Available Votes: {this.state.myInfo.totalVoteNum - this.state.myInfo.voteUsed}</ListGroupItem>
                <ListGroupItem>Number of Candidates I have voted: {this.state.myInfo.numOfPeopleNominated}</ListGroupItem>
                <ListGroupItem>Remaining Times to Modify My Vote(MAX 3 times): {3 - this.state.myInfo.voteTime}</ListGroupItem>
         </ListGroup>
          </Card.Body>
          <Card.Footer>
          
          </Card.Footer>
        </Card>
        <Card>
        <Card.Header><Icon name='plus square' /> My Voting Records</Card.Header>
          <Card.Body>
          <Table bordered hover striped responsive="xl">
						<thead>
					    <tr>
					      <th>Vote Record ID</th>
					      <th>Candidate ID</th>
					      <th>Votes</th>
					      
					    </tr>
					  </thead>
					  <tbody>
                          {this.state.record.recordID.length === 0 ? 
							  <tr align="center">
					           <td colSpan="3"> 0 record avaliable. </td>
					          </tr> : 
                              this.state.record.recordID.map((id) => {
                                return(<tr>
                                <td>{this.state.record.recordID[id]}</td>
                                <td>{this.state.record.candidateID[id]}</td>
                                <td>{this.state.record.voteNum[id]}</td>
                               </tr>);
                              })}

                      </tbody>
						</Table>
          </Card.Body>
          <Card.Footer>
          <Button onClick={this.lookUpVoteRecord}  variant="secondary">
                  <Icon name='search' /> Search My Voting History
         </Button>
          </Card.Footer>
        </Card>
      </CardDeck>
     );
 }

}