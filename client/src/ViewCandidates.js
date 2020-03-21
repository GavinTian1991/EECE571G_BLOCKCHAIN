import React, { Component } from "react";
import {Card,Form, Button,CardColumns,ListGroup,ListGroupItem} from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';

export default class ViewCandidates extends Component{
    constructor(props){
        super(props);
        this.state={candidates:[]};
    }

    async componentDidMount(){
        const candidates = await this.props.viewAllCandidate();
        await this.setState({candidates});
        alert(candidates.length);
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
                                            <ListGroupItem>{candidate.candidateTotalVote}</ListGroupItem>
                                        </ListGroup>
                                        </Card.Body>
                                        <Card.Footer>
                                            <Button variant="secondary">
                                                    <Icon name='hand paper outline' /> Vote
                                            </Button>
                                        </Card.Footer>
                                      </Card>
                                      );
                                  })}

            </CardColumns>
            
        );
    }
}