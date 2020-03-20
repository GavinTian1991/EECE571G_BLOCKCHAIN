import React, { Component } from "react";
import Web3 from 'web3';
import VoteContract from "./contracts/Vote";
import Addressbar from './Addressbar';
import NavigationBar from './NavigationBar.js';
import {Navbar,Nav} from 'react-bootstrap';
import {Link,BrowserRouter as Router,Switch,Route} from 'react-router-dom';
import CreateNewCandidate from './CreateNewCandidate.js';
import MyAccount from './MyAccount.js';
import TestPage from './TestPage.js';
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

    this.getMyInfo = this.getMyInfo.bind(this);


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
    const networkData = VoteContract.networks[networkId]; // try use access network id  to access data from ethbay doc
    if(networkData) {
      const deployedVoteContract = new web3.eth.Contract(VoteContract.abi, networkData.address); // access the contract, address is the contract address, abi work as a bridge
      this.setState({deployedVoteContract: deployedVoteContract}); // add the contract to state
      this.setState({loading: false})
    } else {
      window.alert('Ethbay contract is not found in your blockchain.')
    }
  
  }

  async changeMyvote(candidateId,newVote,voteInfoNum){
    this.setState ({loading: true})
   this.state.deployedVoteContract.methods.changeMyvote(candidateId,newVote,voteInfoNum,309).send({from: this.state.account})
    .once('receipt', (receipt)=> {
      this.setState({loading: false}); // in public blockchain, it may take 10 min to receive the receipt
    })
  }
  
  // call the voters()
  async getMyInfo(address){
    const myInfo = await this.state.deployedVoteContract.methods.voters(address).call();
    return myInfo;
  }
  async createNewCandidate(name,photoURL,candidateInfo){
    this.setState ({loading: true});
    alert("Now estimate gas amount");
    //const gasAmount = await this.state.deployedVoteContract.methods.createNewCandidate(name,photoURL,candidateInfo,109).estimateGas({from: this.state.account});// this.state.deployedEthbay is hte contract we access before
    alert("gas amount OK, start call fun");
    this.state.deployedVoteContract.methods.createNewCandidate(name,photoURL,candidateInfo,109).send({from: this.state.account})
    .once('receipt', (receipt)=> {
      this.setState({loading: false}); // in public blockchain, it may take 10 min to receive the receipt
    })
  }
  async deployShareHold(address,shareHold){
    this.setState ({loading: true});
    alert("gas amount OK, start call fun");
    this.state.deployedVoteContract.methods.deployShareHold(address,shareHold).send({from: this.state.account})
    .once('receipt', (receipt)=> {
      this.setState({loading: false}); // in public blockchain, it may take 10 min to receive the receipt
    })
  }
  async lookUpVoteRecord(recordId){
    this.setState ({loading: true})
    // will emit event containing the vote record Info
    this.state.deployedVoteContract.methods.lookUpVoteRecord(recordId).send({from: this.state.account})
    .once('receipt', (receipt)=> {
      this.setState({loading: false}); // in public blockchain, it may take 10 min to receive the receipt
    })
  }
  async voteForCandidate(candidateId,voteNum){
    this.setState ({loading: true})
    this.state.deployedVoteContract.methods.voteForCandidate(candidateId,voteNum,309).send({from: this.state.account})
    .once('receipt', (receipt)=> {
      this.setState({loading: false}); // in public blockchain, it may take 10 min to receive the receipt
    })
  }

 
  
  render() {
    return (
      <Router>
        <NavigationBar/>
      <div style={{margin: '20px'}}>
        <div>
          <h1>Welcome</h1>
        {"Your Address: " + this.state.account}
        
        </div>
        
          
            
              { this.state.loading 
                ? 
                  <div><p className="text-center">Loading ...</p></div> 
                : 
                <Switch>
                  <Route path="/createCandidate">
                    <CreateNewCandidate createNewCandidate={this.createNewCandidate} deployShareHold={this.deployShareHold}/>
                  </Route>
                  <Route path="/myaccount">
                    <MyAccount getMyInfo={this.getMyInfo} account={this.state.account}/>                  
                  </Route>
                  <Route path="/">
                  <TestPage/>   
                  </Route>
                </Switch>
                  }
            
          
        
      </div>
      </Router>
    );
  }
}

export default App;
