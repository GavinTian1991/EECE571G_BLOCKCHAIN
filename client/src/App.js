import React, { Component } from "react";
import Web3 from 'web3';
import VoteContract from "./contracts/Vote";
import NavigationBar from './NavigationBar.js';
import {BrowserRouter as Router,Switch,Route} from 'react-router-dom';
import CreateNewCandidate from './CreateNewCandidate.js';
import MyAccount from './MyAccount.js';
import TestPage from './TestPage.js';
import Welcome from './Welcome.js';
import ViewCandidates from './ViewCandidates.js'; 
import Result from './Result.js';
import "./App.css";
class App extends Component {
  constructor(props){
     super(props);
     this.state = {
      account: '', // the account here is the account in metamask, so this is why we should reload the page after add an account
      totalCandidate: 0,
      candidates: [],
      loading: true,
      voteType: 1,
      voteSettingStartDate: this.defaultVoteSettingStartDate,
      voteSettingEndDate: this.defaultVoteSettingEndDate,
      voteStartDate: this.defaultVoteStartDate,
      voteEndDate: this.defaultVoteEndDate
    }

    this.getWeb3Provider = this.getWeb3Provider.bind(this);
    this.connectToBlockchain = this.connectToBlockchain.bind(this);

    this.createNewCandidate = this.createNewCandidate.bind(this);
    this.setStartEndDate = this.setStartEndDate.bind(this);
    this.allocateShare = this.allocateShare.bind(this);
    this.changeMyVote = this.changeMyVote.bind(this);
    this.viewAllCandidate = this.viewAllCandidate.bind(this);

    this.lookUpVoteRecord = this.lookUpVoteRecord.bind(this);
    this.voteForCandidate = this.voteForCandidate.bind(this);

    this.viewOneCandidateInfo = this.viewOneCandidateInfo.bind(this);
    this.viewContractDate = this.viewContractDate.bind(this);
    this.viewOneVoterInfo = this.viewOneVoterInfo.bind(this);
    this.viewTotalShares = this.viewTotalShares.bind(this);
    this.viewAllocatedShares = this.viewAllocatedShares.bind(this);
    this.viewMaxAllocatShares = this.viewMaxAllocatShares.bind(this);

    this.getMaxNominatedNum = this.getMaxNominatedNum.bind(this);
    this.getVoteType = this.getVoteType.bind(this);

    this.setVoteSettingStartDate = this.setVoteSettingStartDate.bind(this);
    this.setVoteSettingEndDate = this.setVoteSettingEndDate.bind(this);
    this.setVoteStartDate = this.setVoteStartDate.bind(this);
    this.setVoteEndDate = this.setVoteEndDate.bind(this);
    this.checkVoteSettingDate = this.checkVoteSettingDate.bind(this);
    this.checkVoteDate = this.checkVoteDate.bind(this);
    this.isDeployer = this.isDeployer.bind(this);
    this.changeVoteType = this.changeVoteType.bind(this);
  }

  defaultVoteSettingStartDate = new Date();
  defaultVoteSettingEndDate = new Date();

  defaultVoteStartDate = new Date();
  defaultVoteEndDate = new Date();

  async componentDidMount(){
      await this.getWeb3Provider();
      await this.connectToBlockchain();

      let tmp = await this.viewContractDate(1);
      let tmp2 = await this.viewContractDate(2);
      let tmp3 = await this.viewContractDate(3);
      let tmp4 = await this.viewContractDate(4);

      const _voteSettingStartDate = new Date(tmp[0], tmp[1], tmp[2]);
      this.setState({voteSettingStartDate: _voteSettingStartDate});

      const _voteSettingEndDate = new Date(tmp2[0], tmp2[1], tmp2[2]);
      this.setState({voteSettingEndDate: _voteSettingEndDate});

      const _voteStartDate = new Date(tmp3[0], tmp3[1], tmp3[2]);
      this.setState({voteStartDate: _voteStartDate});

      const _voteEndDate = new Date(tmp4[0], tmp4[1], tmp4[2]);
      this.setState({voteEndDate: _voteEndDate});

      const type = await this.getVoteType();
      this.setState ({voteType: type});
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
      window.alert('Ethbay contract is not found in your blockchain.');
    }
  }

  //Give window alert based on event type
  async contractMessage(eventName){
    await this.state.deployedVoteContract.getPastEvents(eventName,{
      fromBlock: 'latest'
      }, function(error, events){ 
        if(eventName === 'errorMessage'){
          window.alert(events[0].returnValues.errMsg);
        }
        if(eventName === 'allocateShareEvent') {
          window.alert('Share Allocation Finished!');
        }
        if(eventName === 'addCandidate') {
          window.alert('Add Candidate Finished!');
        }
        if(eventName === 'newVoteRecord') {
          window.alert('Vote Candidate Finished!');
        }
        if(eventName === 'changeVoteRecord') {
          window.alert('Change vote Finished!');
        }
    });
  }

  //call createNewCandidate(). For now current time is just a constant. Future direction will change to the real current time
  async createNewCandidate(name,photoURL,candidateInfo){
    this.setState ({loading: true});
    this.state.deployedVoteContract.methods.createNewCandidate(name,photoURL,candidateInfo).send({from: this.state.account})
    .once('receipt', async (receipt)=> {
      let eventsName = Object.keys(receipt.events);
      await this.contractMessage(eventsName[0]);
      this.setState({loading: false}); // in public blockchain, it may take 10 min to receive the receipt
    })
  }

  async changeVoteType(){
    this.setState ({loading: true});
    this.state.deployedVoteContract.methods.changeVoteType().send({from: this.state.account})
    .once('receipt', async (receipt)=> {
      if(this.state.voteType == 1) {
        this.setState ({voteType: 2});
      } else {
        this.setState ({voteType: 1});
      }
      let eventsName = Object.keys(receipt.events);
      await this.contractMessage(eventsName[0]);
      this.setState({loading: false});
    })
  }
  
  reSetAllDateTime = (_date) => {
    this.setState({voteSettingStartDate: _date});
    this.setState({voteSettingEndDate: _date});
    this.setState({voteStartDate: _date});
    this.setState({voteEndDate: _date});
  }

  async setStartEndDate(index, year, month, day){
    if (index == 0) {
      this.reSetAllDateTime(new Date());
    }
    this.setState ({loading: true});
    this.state.deployedVoteContract.methods.contractDateSetting(index, year, month, day).send({from: this.state.account})
    .once('receipt', async (receipt)=> {
      let eventsName = Object.keys(receipt.events);
      await this.contractMessage(eventsName[0]);
      this.setState({loading: false}); 
    })
  }

  async allocateShare(address,shareHold){
    this.setState ({loading: true});
    this.state.deployedVoteContract.methods.allocateShare(address,shareHold).send({from: this.state.account})
    .once('receipt', async (receipt) => {
      let eventsName = Object.keys(receipt.events);
      await this.contractMessage(eventsName[0]);
      this.setState({loading: false}) 
    }).on('error', async (error) => { 
      console.log(error);
    });
  }

  async voteForCandidate(candidateId,voteNum){
    this.setState ({loading: true});
    this.state.deployedVoteContract.methods.voteForCandidate(candidateId,voteNum).send({from: this.state.account})
    .once('receipt', async (receipt)=> {
      let eventsName = Object.keys(receipt.events);
      await this.contractMessage(eventsName[0]);
      this.setState({loading: false}); 
    })
  }

  // the func below call the solidity func
  async changeMyVote(candidateId,newVote,voteInfoNum){
    this.setState ({loading: true});
    this.state.deployedVoteContract.methods.changeMyVote(candidateId,newVote,voteInfoNum).send({from: this.state.account})
    .once('receipt', async (receipt)=> {
      console.log(receipt);
      let eventsName = Object.keys(receipt.events);
      await this.contractMessage(eventsName[0]);
      this.setState({loading: false}); 
    });
  }

  async lookUpVoteRecord() {
    this.state.deployedVoteContract.methods.lookUpVoteRecord().send({from: this.state.account});
    let returnResults;
    await this.state.deployedVoteContract.getPastEvents('lookUpMyVote', {
          filter: {myAddr: this.state.account}, 
          fromBlock: 'latest'
          }, function(error, events) { 
            }).then(function(events) {
                  returnResults = events[events.length - 1].returnValues;
              });
      return returnResults;
    }

 //call viewAllCandidate(). Can return an array containing item obj
  async viewAllCandidate(){
    const totalNumber = await this.state.deployedVoteContract.methods.totalCandidateNumber().call(); 
    let candidates=[];
    candidates.length = totalNumber;
    for (var i = 1;i<= totalNumber;i++) {
        const candidate = await this.state.deployedVoteContract.methods.candidates(i).call(); 
        candidates[i] = candidate; // append the item into the existing item array
    }
    return candidates;
  }

  //Can return an item obj containing one candidate info
  async viewOneCandidateInfo(i){
    const candidate = await this.state.deployedVoteContract.methods.candidates(i).call();
    return candidate;
  }

  async viewContractDate(i){
    const contractDate = await this.state.deployedVoteContract.methods.contractDates(i).call();
    return contractDate;
  }

    //Can return an item obj containing one voter info
    async viewOneVoterInfo(address){
      const voter = await this.state.deployedVoteContract.methods.voters(address).call();
      return voter;
    }

  // view amount of total shares
  async viewTotalShares(){
    const totalNumber = await this.state.deployedVoteContract.methods.totalShareNum().call(); 
    return totalNumber;
  }
  
    // view amount of total allocated shares
    async viewAllocatedShares(){
      const totalNumber = await this.state.deployedVoteContract.methods.currentTotalShareNum().call(); 
      return totalNumber;
    }
  
    async viewMaxAllocatShares(){
      const totalNumber = await this.state.deployedVoteContract.methods.maxShareNum().call(); 
      return totalNumber;
    }

    async getMaxNominatedNum(){
      const maxNumber = await this.state.deployedVoteContract.methods.maxNominatedNum().call(); 
      return maxNumber;
    }

    async getVoteType(){
      const voteType = await this.state.deployedVoteContract.methods.voteType().call(); 
      return voteType;
    }

    //determine whether current account is deployer
    async isDeployer(){
      const deployer = await this.state.deployedVoteContract.methods.voteDeployer().call();
      const user = this.state.account;
      if(deployer !== user){
        return false;
      }
      return true;
    }

    //set date and check if date is valid
    async setVoteSettingStartDate(voteSettingStartDate){
      await this.setStartEndDate(1, voteSettingStartDate.getFullYear(), 
      voteSettingStartDate.getMonth(), 
      voteSettingStartDate.getDate());
      this.setState({voteSettingStartDate});
    }

    async setVoteSettingEndDate(voteSettingEndDate){
      if(voteSettingEndDate < this.state.voteSettingStartDate) {
        alert("Wrong vote setting end date, please reset.");
        return;
      }
      await this.setStartEndDate(2, voteSettingEndDate.getFullYear(), 
      voteSettingEndDate.getMonth(), 
      voteSettingEndDate.getDate());
      this.setState({voteSettingEndDate});
    }

    async setVoteStartDate(voteStartDate){
      if(voteStartDate < this.state.voteSettingEndDate) {
        alert("Wrong vote start date, please reset.");
        return;
      }
      await this.setStartEndDate(3, voteStartDate.getFullYear(), 
      voteStartDate.getMonth(), 
      voteStartDate.getDate());
      this.setState({voteStartDate});
      localStorage.setItem('voteStartDate',voteStartDate);
    }

    async setVoteEndDate(voteEndDate){
      if(voteEndDate < this.state.voteStartDate) {
        alert("Wrong vote end date, please reset.");
        return;
      }
      await this.setStartEndDate(4, voteEndDate.getFullYear(), 
      voteEndDate.getMonth(), 
      voteEndDate.getDate());
      this.setState({voteEndDate});
    }

    checkVoteSettingDate(index){
     let nowDate = new Date();
     let startDate = this.state.voteSettingStartDate;
     let endDate = this.state.voteSettingEndDate;
     const now = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
     const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
     const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
     const validDate = this.dateCompare(start, end, now);
     if(index === 0) {
       if(validDate) {
          alert("You can change vote setting today.");
       } else {
          alert("Exceed vote setting deadline.");
       }
     }
     return validDate;
    }

    checkVoteDate(index){
      let nowDate = new Date();
      let startDate = this.state.voteStartDate;
      let endDate = this.state.voteEndDate;
      const now = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const validDate = this.dateCompare(start, end, now);
      if(index === 0) {
        if(validDate) {
           alert("You can vote today.");
        } else {
           alert("Exceed vote deadline.");
        }
      }
      return validDate;
    }

    dateCompare(startDate, endDate, nowDate) {
      if(startDate <= nowDate && nowDate <= endDate) {
        return true;
      }
      return false; 
    }

  render() {
    return (
      <Router>
        <NavigationBar/>
      <div style={{margin: '20px'}}>
        <div>
          <h1>Hello, welcome to D-vote!</h1>
          {this.state.voteType == 1 ? <h2>Straight Voting</h2> : <h2>Cumulative Voting</h2>}
        {"Your Address: " + this.state.account}
        </div>
              { this.state.loading 
                ? 
                  <div><p className="text-center">Loading ...</p></div> 
                : 
                <Switch>
                  <Route path="/createCandidate">
                    <CreateNewCandidate createNewCandidate={this.createNewCandidate} allocateShare={this.allocateShare} 
                        viewTotalShares={this.viewTotalShares} viewAllocatedShares={this.viewAllocatedShares} viewMaxAllocatShares={this.viewMaxAllocatShares} 
                        checkVoteSettingDate={this.checkVoteSettingDate} />
                  </Route>
                  <Route path="/myaccount">
                    <MyAccount viewOneVoterInfo={this.viewOneVoterInfo} account={this.state.account} lookUpVoteRecord={this.lookUpVoteRecord} 
                               changeMyVote={this.changeMyVote} viewOneCandidateInfo={this.viewOneCandidateInfo}
                               checkVoteDate={this.checkVoteDate} getVoteType={this.getVoteType}/>                  
                  </Route>
                  <Route path="/gotovote">
                    <ViewCandidates viewAllCandidate={this.viewAllCandidate} voteForCandidate={this.voteForCandidate} 
                                    checkVoteDate={this.checkVoteDate} getVoteType={this.getVoteType}/>                  
                  </Route>
                  <Route path="/viewresult">
                    <Result viewAllCandidate={this.viewAllCandidate}/>                  
                  </Route>
                  <Route path="/voteinfo">
                    <TestPage getMaxNominatedNum={this.getMaxNominatedNum} 
                              getVoteType={this.getVoteType} 
                              setVoteSettingStartDate={this.setVoteSettingStartDate}
                              setVoteSettingEndDate={this.setVoteSettingEndDate}
                              setVoteStartDate={this.setVoteStartDate}
                              setVoteEndDate={this.setVoteEndDate}
                              checkVoteSettingDate={this.checkVoteSettingDate}
                              checkVoteDate={this.checkVoteDate}
                              isDeployer={this.isDeployer}
                              setStartEndDate={this.setStartEndDate}
                              changeVoteType={this.changeVoteType}
                              voteSettingStartDate={this.state.voteSettingStartDate}
                              voteSettingEndDate={this.state.voteSettingEndDate}
                              voteStartDate={this.state.voteStartDate}
                              voteEndDate={this.state.voteEndDate}
                    />      
                  </Route>
                  <Route path="/">
                    <Welcome getMaxNominatedNum={this.getMaxNominatedNum} 
                             getVoteType={this.getVoteType} />
                  </Route>
                </Switch>
                  }
      </div>
      </Router>
    );
  }
}

export default App;
