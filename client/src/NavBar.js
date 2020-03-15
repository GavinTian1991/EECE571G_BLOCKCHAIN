import React from 'react';
import {Navbar,Nav} from 'react-bootstrap';
import {Link} from 'react-router-dom';
class NavigationBar extends React.Component{
	render(){
		return (
				<Navbar bg="light">
				<Link to={""} className="navbar-brand">My D-Vote</Link>
				
				<Nav className="mr-auto">
			      <Link to={"/"} className="nav-link">Create New Candidate</Link>
			      <Link to={"deployShareHold"} className="nav-link">Deploy ShareHold</Link>
                  <Link to={"lookUpVoteRecord"} className="nav-link">Look Up My Vote Record</Link>
                  <Link to={"voteForCandidate"} className="nav-link">Vote For Candidate</Link>
                  
			    </Nav>
				</Navbar>
         );
	}
}

export default NavigationBar;