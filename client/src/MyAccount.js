import React, { Component } from "react";
import {Card,Form, Button, Table,CardDeck,ListGroup,ListGroupItem,Col,Popover,OverlayTrigger} from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';

export default class MyAccount extends Component{
  constructor(props){
     super(props);
     this.state={account:this.props.account,myInfo:this.initialInfo,record:this.initialRecord,names:[], 
                 voteDateValid:true, lookUpService: true, voteType: 1};
    
     this.lookUpVoteRecord = this.lookUpVoteRecord.bind(this);
     this.infoChange = this.infoChange.bind(this);
     this.submitChangeVote = this.submitChangeVote.bind(this);

  }
  initialInfo={stock:0 ,totalVoteNum:0,voteUsed:0,numOfPeopleNominated:0,voteTime:0};
  initialRecord={myAddr:"",recordID:[],candidateID:[],voteNum:[]};
  // call the voters()
  async componentDidMount(){
    const myInfomation = await this.props.viewOneVoterInfo(this.state.account);
    this.setState({myInfo:myInfomation});
    const voteDateValid = await this.props.checkVoteDate(1);
    this.setState({voteDateValid});
    const voteType = await this.props.getVoteType();
    this.setState({voteType});
    if(this.state.myInfo.numOfPeopleNominated == 0) {
      this.setState({lookUpService:false});
    }
  }

  async lookUpVoteRecord(){
      const record = await this.props.lookUpVoteRecord();
      this.setState({record});
    for(let i=0;i<record.candidateID.length;i++){
      const candidate = await this.props.viewOneCandidateInfo(record.candidateID[i]);
      const name = await candidate.candidateName;
      this.setState({names:[...this.state.names,name]});
   }
  }

  infoChange = event =>{
    this.setState({
        [event.target.name]:event.target.value
    });}

    submitChangeVote = event =>{
        event.preventDefault();
        if(this.state.voteType != 1) {
          this.props.changeMyVote(this.state.candidateId,this.state.newVote,this.state.voteInfoNum);
        } else {
            this.props.changeMyVote(this.state.candidateId,5,this.state.voteInfoNum);
        }
    }

 render(){
      const popover = (
        <Popover id="popover-basic">
          <Popover.Title as="h3">Caution</Popover.Title>
          <Popover.Content>
          If you have changed your past voting record and then immediately click this button, the record may not be updated. If so, try again later!
          </Popover.Content>
        </Popover>
      );
     return(
        <CardDeck>
        <Card>
        <Card.Header><Icon name='plus square' /> My Basic Info</Card.Header>
          <Card.Body>
          <ListGroup className="list-group-flush">
                <ListGroupItem>Total Share: {this.state.myInfo.stock}</ListGroupItem>
                <ListGroupItem>Total Votes: {this.state.myInfo.totalVoteNum}</ListGroupItem>
                <ListGroupItem>Votes Used: {this.state.myInfo.voteUsed}</ListGroupItem>
                <ListGroupItem>Available Votes: {this.state.myInfo.totalVoteNum - this.state.myInfo.voteUsed}</ListGroupItem>
                <ListGroupItem>Number of Candidates I have voted: {this.state.myInfo.numOfPeopleNominated}</ListGroupItem>
                <ListGroupItem>Remaining Times to Modify My Vote(MAX 3 times): {3 - this.state.myInfo.voteChangeNum}</ListGroupItem>
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
                <th>Candidate Name</th>
					      <th>Votes</th>
					    </tr>
					  </thead>
					  <tbody>
                {this.state.record.recordID.length === 0 ? 
							  <tr align="center">
					           <td colSpan="4"> 0 record avaliable. </td>
					          </tr> : 
                              this.state.record.recordID.map((id, index) => {
                                let newID = parseInt(id)+1;
                                return(<tr key={index}>
                                  <td>{newID}</td>
                                  <td>{this.state.record.candidateID[id]}</td>
                                  <td>{this.state.names[id]}</td>
                                  <td>{this.state.record.voteNum[id]}</td>
                               </tr>);
                              })}
                      </tbody>
						</Table>
          </Card.Body>
          <Card.Footer>
            <OverlayTrigger placement="right" overlay={popover}>
                <Button onClick={this.lookUpVoteRecord}  variant="secondary" disabled={!this.state.lookUpService}>
                        <Icon name='search' /> Search My Voting History
                </Button>
            </OverlayTrigger>
          </Card.Footer>
        </Card>
        <Card>
        <Form style={{height: '100%'}}  onSubmit={this.submitChangeVote} id="submitChangeVoteFormId">
        <Card.Header><Icon name='plus square' /> Change My Vote</Card.Header>
          <Card.Body>
                    <Form.Row>
                      <Form.Group as={Col} controlId="formGridName">
                        <Form.Label>Record ID</Form.Label>
                        <Form.Control required autoComplete="off"
                            type="text" 
                            name="voteInfoNum" 
                            onChange={this.infoChange}
                            className={"bg-light"} 
                            placeholder="Enter the vote record youn want to modify" />
                      </Form.Group>
                      </Form.Row>
                      <Form.Row>
                      <Form.Group as={Col} controlId="formGridColor">
                        <Form.Label>Candidate ID</Form.Label>
                        <Form.Control autoComplete="off" 
                        type="text" 
                        name="candidateId"
                        onChange={this.infoChange}
                        className={"bg-light"} placeholder="Enter the new ID of candidate you want to vote now" />
                      </Form.Group>
                    </Form.Row>
                    {this.state.voteType == 1 ? <Form.Row /> :
                      <Form.Row>
                        <Form.Group as={Col} controlId="formGridColor">
                          <Form.Label>Votes</Form.Label>
                          <Form.Control autoComplete="off" 
                          type="text" 
                          name="newVote"
                          onChange={this.infoChange}
                          className={"bg-light"} placeholder="Enter the number of new votes" />
                        </Form.Group>
                      </Form.Row>
                    }
          </Card.Body>
          
          <Card.Footer>
          <Button size="sm" variant="success" type="submit" disabled={!this.state.voteDateValid || this.state.myInfo.voteChangeNum == 3}>
                  <Icon name='save' /> Confirm
                  </Button>{" "}
          </Card.Footer>
          </Form> 
        </Card>
      </CardDeck>
     );
 }
}