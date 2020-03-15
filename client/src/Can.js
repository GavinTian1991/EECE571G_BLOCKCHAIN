import React, { Component } from "react";
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';

class Can extends Component {
    render() {
        return (
            <CardGroup style={{ width: '60rem'}}>  
                {this.props.canData.map((data,index)=>{
                        return(
                            <Card style={{ width: '15rem'}} key={index}>
                            <Card.Img variant="top" src={this.props.canImages[index]} height="300"/>
                            <Card.Body>
                                <Card.Link>{data.name}</Card.Link>
                                <ListGroup className="list-group-flush">
                                <ListGroupItem>Id: {data.id}</ListGroupItem>
                                <ListGroupItem>Age: {data.age}</ListGroupItem>
                                <ListGroupItem>{data.party}</ListGroupItem>
                                <ListGroupItem>Vote: {data.voteCount}</ListGroupItem>
                                </ListGroup>
                                <Button variant="primary" onClick={async (event)=>{
                              await this.props.voteForCandidate(data.id);
                            }}>Vote</Button>
                            </Card.Body>
                            </Card>
                        )
                    }
                )
            }
            </CardGroup>
        )
    }
}


export default Can;
