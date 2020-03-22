import React, { Component } from "react";
import {Card,Form, Button,CardColumns,ListGroup,ListGroupItem,Row,Col} from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';

export default class ViewCandidates extends Component{
    constructor(props){
        super(props);
        this.state={candidates:[]};
        this.voteForCandidate = this.voteForCandidate.bind(this);
        this.infoChange = this.infoChange.bind(this);
    }

    async componentDidMount(){
        const candidates = await this.props.viewAllCandidate();
        await this.setState({candidates});
    }

    infoChange = event =>{
        this.setState({
            [event.target.name]:event.target.value
        });}

    voteForCandidate(inputID){
        return event => {
            event.preventDefault();
            this.props.voteForCandidate(inputID,this.state.voteNumInput);
            //alert("id: "+inputID+"vote: "+ this.state.voteNumInput);
        }
    }

    render(){
        return(
            <CardColumns>
                {this.state.candidates.length === 0 ? 
                                  <Card style={{ width: '18rem' }}>
                                  <Card.Img variant="top" src="https://www.pngitem.com/pimgs/m/80-800194_transparent-users-icon-png-flat-user-icon-png.png" />
                                  <Card.Body>
                                    <Card.Title>No Candidate Availiable</Card.Title>
                                    <Card.Text>
                                        There is no candidate available. Please wait for the contract deployer add candidates.
                                    </Card.Text>
                                  </Card.Body>
                                </Card> : 
                                  this.state.candidates.map((candidate) => {
                                    return(
                                    <Card>
                                        <Card.Img variant="top" src={candidate.candidatePhoto} />
                                        <Card.Body>
                                         <Card.Title>{candidate.candidateName}</Card.Title>
                                         <ListGroup className="list-group-flush">
                                            <ListGroupItem>{candidate.candidateInfo}</ListGroupItem>
                                            <ListGroupItem>Total Votes: {candidate.candidateTotalVote}</ListGroupItem>
                                        </ListGroup>

                                        <Form onSubmit={this.voteForCandidate(candidate.candidateId)} style={{ margin: '40px' }}>
                                        <Form.Group as={Row} controlId="formGridName">
                                        {/* <input type="hidden" name="voteIDInput" onChange={this.infoChange} value={candidate.candidateId}/> */}
                                        
                                            <Form.Label>Votes:</Form.Label>
                                            <Col>
                                            <Form.Control required autoComplete="off"
                                                type="text" 
                                                name="voteNumInput"
                                                onChange={this.infoChange}
                                                className={"bg-light"} 
                                                placeholder="Enter the Number of votes" />
                                            </Col>
                                        </Form.Group>
                                        <Button onClick={this.voteForCandidate}  variant="secondary" type="submit">
                                                <Icon name='hand paper outline'/> Vote
                                        </Button>
                                        </Form>
                                        </Card.Body>
                                        <Card.Footer>

                                        </Card.Footer>
                                      </Card>
                                      );
                                  })}

            </CardColumns>
            
        );
    }
}