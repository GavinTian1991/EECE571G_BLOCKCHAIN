import React, { Component } from "react";
import Web3 from 'web3';
import VoteContract from "./contracts/Vote.json";
import Addressbar from './Addressbar';
import Main from './Main';
import "./App.css";



class App extends Component {
  constructor(props){
     super(props);
     
     this.state = {
      account: '', // the account here is the account in metamask, so this is why we should reload the page after add an account
      totalCandidate: 0,
      candidates: [],
      loading: true
    }

    this.getWeb3Provider = this.getWeb3Provider.bind(this);
    this.connectToBlockchain = this.connectToBlockchain.bind(this);

    this.changeMyvote = this.changeMyvote.bind(this);
    this.createNewCandidate = this.createNewCandidate.bind(this);
    this.deployShareHold = this.deployShareHold.bind(this);
    this.lookUpVoteRecord = this.lookUpVoteRecord.bind(this);
    this.voteForCandidate = this.voteForCandidate.bind(this);


  }

  async componentDidMount(){
    await this.getWeb3Provider();
    await this.connectToBlockchain();
  }
  
  async getWeb3Provider(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider); // try to connect metamask
    }
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async connectToBlockchain(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]})
    const networkId = await web3.eth.net.getId() // get network id from metamask
    const networkData = Ethbay.networks[networkId]; // try use access network id  to access data from ethbay doc
    if(networkData) {
      const deployedVoteContract = new web3.eth.Contract(VoteContract.abi, networkData.address); // access the contract, address is the contract address, abi work as a bridge
      this.setState({deployedVoteContract: deployedVoteContract}); // add the contract to state
      
    } else {
      window.alert('Ethbay contract is not found in your blockchain.')
    }
  
  }

  async changeMyvote(){}
  async createNewCandidate(){}
  async deployShareHold(){}
  async lookUpVoteRecord(){}
  async voteForCandidate(){}

 
  
  render() {
    return (
      <Router>
        <Navbar bg="light">
				<Link to={""} className="navbar-brand">My D-Vote</Link>
				
				<Nav className="mr-auto">
			      <Link to={{pathname:"/",state=this.state}} className="nav-link">Create New Candidate</Link>
			      <Link to={{pathname:"deployShareHold",state=this.state}} className="nav-link">Deploy ShareHold</Link>
                  <Link to={{pathname:"lookUpVoteRecord",state=this.state}} className="nav-link">Look Up My Vote Record</Link>
                  <Link to={{pathname:"voteForCandidate",state=this.state}} className="nav-link">Vote For Candidate</Link>
                  
			    </Nav>
				</Navbar>
      <div>
        <Addressbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main>
              { this.state.loading 
                ? 
                  <div><p className="text-center">Loading ...</p></div> 
                : 
                <Switch>
                <Route path="/" exact component={CreateNewCandidate}/>
                <Route path="/deployShareHold" exact component={DeployShareHold}/>
                <Route path="/lookUpVoteRecord" exact component={LookUpVoteRecord}/>
                <Route path="/voteForCandidate" exact component={VoteForCandidate}/>
                </Switch>
                  }
            </main>
          </div>
        </div>
      </div>
      </Router>
    );
  }
}

export default App;
