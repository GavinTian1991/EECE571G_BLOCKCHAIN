import React, { Component } from "react";
import {Card,Form, Button, Col,CardDeck} from 'react-bootstrap';
import { Icon } from 'semantic-ui-react'
import "./App.css";

export default class CreateNewCandidate extends Component{
  constructor(props){
    super(props);
    this.state = this.initialState;
    this.submitCandidate = this.submitCandidate.bind(this);
    this.infoChange = this.infoChange.bind(this);
    this.resetProduct = this.resetProduct.bind(this);
    this.submitShare = this.submitShare.bind(this);
    this.resetShare = this.resetShare.bind(this);
  }
  
  initialState = {name:'',photoUrl:'',cadidateInfo:'',address:'',amount:''};


  submitCandidate = event => {
    event.preventDefault();
    this.props.createNewCandidate(this.state.name,this.state.photoUrl,this.state.cadidateInfo);
    
    this.setState({name:'',photoUrl:'',cadidateInfo:''});
   }

   submitShare = event => {
    event.preventDefault();
    this.props.allocateShare(this.state.address,this.state.amount);
    
    this.setState({address:'',amount:''});
   }

   infoChange = event =>{
    this.setState({
        [event.target.name]:event.target.value
    });
}
resetProduct= () => {
    this.setState({name:'',photoUrl:'',cadidateInfo:''});
}

resetShare=()=>{
  this.setState({address:'',amount:''});
}
render(){
    return(
      <CardDeck>
            <Card className="border border-dark bg-light">
                <Card.Header><Icon name='plus square' /> Split Share</Card.Header>
                <Form onReset={this.resetProduct} onSubmit={this.submitShare} id="shareFormId">
                <Card.Body>
                    <Form.Row>
                      <Form.Group as={Col} controlId="formGridName">
                        <Form.Label>Account Address</Form.Label>
                        <Form.Control required autoComplete="off"
                            type="text" 
                            name="address" 
                            value={this.state.address}
                            onChange={this.infoChange}
                            className={"bg-light"} 
                            placeholder="Enter the shareholder's address" />
                      </Form.Group>
                      <Form.Group as={Col} controlId="formGridColor">
                        <Form.Label>Equity</Form.Label>
                        <Form.Control autoComplete="off" 
                        type="text" 
                        name="amount"
                        value={this.state.amount}
                        onChange={this.infoChange}
                        className={"bg-light"} placeholder="Enter the amount of stock you want to allocate" />
                      </Form.Group>
                    </Form.Row>
                </Card.Body>
                <Card.Footer style={{"textAlign":"right"}}>
                  <Button size="sm" variant="success" type="submit">
                  <Icon name='save' /> Submit
                  </Button>{" "}
                  <Button size="sm" variant="info" type="reset">
                  <Icon name='repeat' /> Reset
                  </Button>
                </Card.Footer>
                </Form>
            </Card>
            <Card className="border border-dark bg-light">
                <Card.Header><Icon name='plus square' /> Add Candidate</Card.Header>
                <Form onReset={this.resetProduct} onSubmit={this.submitCandidate} id="candidateFormId">
                <Card.Body>
                    <Form.Row>
                      <Form.Group as={Col} controlId="formGridName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control required autoComplete="off"
                            type="text" 
                            name="name" 
                            value={this.state.name}
                            onChange={this.infoChange}
                            className={"bg-light"} 
                            placeholder="Enter candidate name" />
                      </Form.Group>
                      <Form.Group as={Col} controlId="formGridColor">
                        <Form.Label>photo URL</Form.Label>
                        <Form.Control autoComplete="off" 
                        type="text" 
                        name="photoUrl"
                        value={this.state.photoUrl}
                        onChange={this.infoChange}
                        className={"bg-light"} placeholder="Enter candidate photo url" />
                      </Form.Group>
                    </Form.Row>
                    <Form.Row>
                      <Form.Group as={Col} sm={10} controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Cadidate Info</Form.Label>
                        <Form.Control required autoComplete="off" as="textarea" rows="6" 
                        type="text" 
                        name="cadidateInfo"
                        value={this.state.cadidateInfo}
                        onChange={this.infoChange}
                        className={"bg-light"} placeholder="Enter cadidate Info" />
                      </Form.Group>                   
                    </Form.Row>
                    
                   
                </Card.Body>
                <Card.Footer style={{"textAlign":"right"}}>
                  <Button size="sm" variant="success" type="submit">
                  <Icon name='save' /> Submit
                  </Button>{" "}
                  <Button size="sm" variant="info" type="reset">
                  <Icon name='repeat' /> Reset
                  </Button>
                </Card.Footer>
                </Form>
            </Card>
          </CardDeck>
            
    );
}

}