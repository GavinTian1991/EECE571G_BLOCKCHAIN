import React from 'react';
import {Navbar,Nav} from 'react-bootstrap';
import {Link} from 'react-router-dom';
class NavigationBar extends React.Component{
	render(){
		return (
				<Navbar bg="dark" variant="dark">
				<Link to={"/"} className="navbar-brand">D-Vote</Link>
				<Nav className="mr-auto">
			      <Link to={"/voteinfo"} className="nav-link">Vote Info</Link>
			      <Link to={"/gotovote"} className="nav-link">Vote</Link>
                  <Link to={"/viewresult"} className="nav-link">Results</Link>
                  <Link to={"/myaccount"} className="nav-link">My account</Link>
                  <Link to={"/createCandidate"} className="nav-link">Vote Setting</Link>
			    </Nav>
				</Navbar>
         );
	}
}

export default NavigationBar;