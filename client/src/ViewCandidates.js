import React, { Component } from "react";
import {Card,Form, Button,CardColumns,ListGroup,ListGroupItem,Row,Col} from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';

export default class ViewCandidates extends Component{
    constructor(props){
        super(props);
        this.state={candidates:[],voteDateValid:true,voteType:1};
        this.voteForCandidate = this.voteForCandidate.bind(this);
        this.infoChange = this.infoChange.bind(this);
    }

    async componentDidMount(){
        const candidates = await this.props.viewAllCandidate();
        this.setState({candidates});
        const voteDateValid = await this.props.checkVoteDate(1);
        this.setState({voteDateValid});
        const voteType = await this.props.getVoteType();
        this.setState({voteType});
    }

    infoChange = event =>{
        this.setState({
            [event.target.name]:event.target.value
        });}

    voteForCandidate(inputID){
        return event => {
            event.preventDefault();
            if(this.state.voteType != 1) {
                this.props.voteForCandidate(inputID,this.state.voteNumInput);
            } else {
                this.props.voteForCandidate(inputID,10);  //it does not matter about the share,
            }
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
                    this.state.candidates.map((candidate, index) => {
                    return(
                    <Card key={index}>
                        <Card.Img variant="top" src={candidate.candidatePhoto} />
                        <Card.Body>
                            <Card.Title>{candidate.candidateName}</Card.Title>
                            <ListGroup className="list-group-flush">
                            <ListGroupItem>{candidate.candidateInfo}</ListGroupItem>
                            <ListGroupItem>Total Votes: {candidate.candidateTotalVote}</ListGroupItem>
                            <ListGroupItem>Candidate ID: {candidate.candidateId}</ListGroupItem>
                        </ListGroup>

                        <Form onSubmit={this.voteForCandidate(candidate.candidateId)} style={{ margin: '40px' }}>
                        {this.state.voteType != 1 ?
                            <Form.Group as={Row} controlId="formGridName">
                                <Form.Label>Votes:</Form.Label>
                                <Col>
                                    <Form.Control required autoComplete="off"
                                        type="text" 
                                        name="voteNumInput"
                                        onChange={this.infoChange}
                                        className={"bg-light"} 
                                        placeholder="Enter the Number of votes" />
                                </Col>
                            </Form.Group> : <Form.Group />
                        }
                            <Button onClick={this.voteForCandidate}  variant="secondary" type="submit" disabled={!this.state.voteDateValid}>
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