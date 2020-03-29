import React, { Component } from "react";
import Web3 from 'web3';
import Moment from 'moment';
import VoteContract from "./contracts/Vote";
import NavigationBar from './NavigationBar.js';
import {BrowserRouter as Router,Switch,Route} from 'react-router-dom';
import CreateNewCandidate from './CreateNewCandidate.js';
import MyAccount from './MyAccount.js';
import TestPage from './TestPage.js';
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
      voteSettingStartDate: this.defaultVoteSettingStartDate,
      voteSettingEndDate: this.defaultVoteSettingEndDate,
      voteStartDate: this.defaultVoteStartDate,
      voteEndDate: this.defaultVoteEndDate
    }

    this.getWeb3Provider = this.getWeb3Provider.bind(this);
    this.connectToBlockchain = this.connectToBlockchain.bind(this);

    this.createNewCandidate = this.createNewCandidate.bind(this);
    this.allocateShare = this.allocateShare.bind(this);
    this.changeMyVote = this.changeMyVote.bind(this);
    this.viewAllCandidate = this.viewAllCandidate.bind(this);

    this.lookUpVoteRecord = this.lookUpVoteRecord.bind(this);
    this.voteForCandidate = this.voteForCandidate.bind(this);
    this.getMyInfo = this.getMyInfo.bind(this);

    this.viewOneCandidateInfo = this.viewOneCandidateInfo.bind(this);
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
  }

  defaultVoteSettingStartDate = new Date();
  defaultVoteSettingEndDate = new Date();

  defaultVoteStartDate = new Date();
  defaultVoteEndDate = new Date();

  async componentDidMount(){
      await this.getWeb3Provider();
      await this.connectToBlockchain();
      const voteSettingStartDate = localStorage.getItem("voteSettingStartDate");
      this.setState({voteSettingStartDate});
      const voteSettingEndDate = localStorage.getItem("voteSettingEndDate");
      this.setState({voteSettingEndDate});
      const voteStartDate = localStorage.getItem("voteStartDate");
      this.setState({voteStartDate});
      const voteEndDate = localStorage.getItem("voteEndDate");
      this.setState({voteEndDate});
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
    this.state.deployedVoteContract.methods.createNewCandidate(name,photoURL,candidateInfo,150).send({from: this.state.account})
    .once('receipt', async (receipt)=> {
      let eventsName = Object.keys(receipt.events);
      await this.contractMessage(eventsName[0]);
      this.setState({loading: false}); // in public blockchain, it may take 10 min to receive the receipt
    })
  }

  async allocateShare(address,shareHold){
    this.setState ({loading: true});
    //alert("gas amount OK, start call fun");
    this.state.deployedVoteContract.methods.allocateShare(address,shareHold).send({from: this.state.account})
    .once('receipt', async (receipt) => {
      let eventsName = Object.keys(receipt.events);
      await this.contractMessage(eventsName[0]);
      this.setState({loading: false}) // in public blockchain, it may take 10 min to receive the receipt
    }).on('error', async (error) => { 
      console.log(error)
    });
  }

  async voteForCandidate(candidateId,voteNum){
    this.setState ({loading: true})
    this.state.deployedVoteContract.methods.voteForCandidate(candidateId,voteNum,309).send({from: this.state.account})
    .once('receipt', async (receipt)=> {
      let eventsName = Object.keys(receipt.events);
      await this.contractMessage(eventsName[0]);
      this.setState({loading: false}); // in public blockchain, it may take 10 min to receive the receipt
    })
  }

  // the func below call the solidity func
  async changeMyVote(candidateId,newVote,voteInfoNum){
    this.setState ({loading: true})
    this.state.deployedVoteContract.methods.changeMyVote(candidateId,newVote,voteInfoNum,309).send({from: this.state.account})
    .once('receipt', async (receipt)=> {
      let eventsName = Object.keys(receipt.events);
      await this.contractMessage(eventsName[0]);
      this.setState({loading: false}); // in public blockchain, it may take 10 min to receive the receipt
    });
  }
  
  // call the voters()
  async getMyInfo(address){
    const myInfo = await this.state.deployedVoteContract.methods.voters(address).call();
    return myInfo;
  }

  async lookUpVoteRecord(){
    this.state.deployedVoteContract.methods.lookUpVoteRecord().send({from: this.state.account});
    let returnResults;
    await this.state.deployedVoteContract.getPastEvents('lookUpMyVote',{
          filter: {myAddr: this.state.account}, 
          fromBlock: 0
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
        const candidate = await this.state.deployedVoteContract.methods.candidates(i).call(); // get each items info, item is a mapping(addr => Item)
        candidates[i] = candidate; // append the item into the existing item array
    }
    return candidates;
  }

  //Can return an item obj containing one candidate info
  async viewOneCandidateInfo(i){
    const candidate = await this.state.deployedVoteContract.methods.candidates(i).call();
    return candidate;
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
      if(deployer != user){
        return false;
      }
      return true;
    }

    //set date and check if date is valid
    setVoteSettingStartDate(voteSettingStartDate){
      this.setState({voteSettingStartDate});
      localStorage.setItem('voteSettingStartDate',voteSettingStartDate);
    }

    setVoteSettingEndDate(voteSettingEndDate){
      if(voteSettingEndDate < this.state.voteSettingStartDate) {
        alert("Wrong vote setting end date, please reset.");
        return;
      }
      this.setState({voteSettingEndDate});
      localStorage.setItem('voteSettingEndDate',voteSettingEndDate);
    }

    setVoteStartDate(voteStartDate){
      if(voteStartDate < this.state.voteSettingEndDate) {
        alert("Wrong vote start date, please reset.");
        return;
      }
      this.setState({voteStartDate});
      localStorage.setItem('voteStartDate',voteStartDate);
    }

    setVoteEndDate(voteEndDate){
      if(voteEndDate < this.state.voteStartDate) {
        alert("Wrong vote end date, please reset.");
        return;
      }
      this.setState({voteEndDate});
      localStorage.setItem('voteEndDate',voteEndDate);
    }

    checkVoteSettingDate(index){
     const now = new Date();
     const start = new Date(this.state.voteSettingStartDate);
     const end = new Date(this.state.voteSettingEndDate);
     const validDate = this.dateCompare(start, end, now);
     //const validDate = now.isSameOrAfter(this.state.voteSettingStartDate) && now.isSameOrBefore(this.state.voteSettingEndDate);
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
      // const now = new Moment();
      // const validDate = (now.isSameOrAfter(this.state.voteStartDate) && now.isSameOrBefore(this.state.voteEndDate));
      const now = new Date();
      const start = new Date(this.state.voteStartDate);
      const end = new Date(this.state.voteEndDate);
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
      const year = startDate.getFullYear() <= nowDate.getFullYear() && nowDate.getFullYear() <= endDate.getFullYear();
      const month = startDate.getMonth() <= nowDate.getMonth() && nowDate.getMonth() <= endDate.getMonth();
      const day = startDate.getDate() <= nowDate.getDate() && nowDate.getDate() <= endDate.getDate();
      return year && month && day;
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
                    <CreateNewCandidate createNewCandidate={this.createNewCandidate} allocateShare={this.allocateShare} 
                        viewTotalShares={this.viewTotalShares} viewAllocatedShares={this.viewAllocatedShares} viewMaxAllocatShares={this.viewMaxAllocatShares} 
                        checkVoteSettingDate={this.checkVoteSettingDate} />
                  </Route>
                  <Route path="/myaccount">
                    <MyAccount getMyInfo={this.getMyInfo} account={this.state.account} lookUpVoteRecord={this.lookUpVoteRecord} 
                               changeMyVote={this.changeMyVote} viewOneCandidateInfo={this.viewOneCandidateInfo}
                               checkVoteDate={this.checkVoteDate} />                  
                  </Route>
                  <Route path="/gotovote">
                    <ViewCandidates viewAllCandidate={this.viewAllCandidate} voteForCandidate={this.voteForCandidate} 
                                    checkVoteDate={this.checkVoteDate}/>                  
                  </Route>
                  <Route path="/viewresult">
                    <Result viewAllCandidate={this.viewAllCandidate}/>                  
                  </Route>
                  <Route path="/">
                  <TestPage getMaxNominatedNum={this.getMaxNominatedNum} 
                            getVoteType={this.getVoteType} 
                            setVoteSettingStartDate={this.setVoteSettingStartDate}
                            setVoteSettingEndDate={this.setVoteSettingEndDate}
                            setVoteStartDate={this.setVoteStartDate}
                            setVoteEndDate={this.setVoteEndDate}
                            checkVoteSettingDate={this.checkVoteSettingDate}
                            checkVoteDate={this.checkVoteDate}
                            isDeployer={this.isDeployer}
                            voteSettingStartDate={this.state.voteSettingStartDate}
                            voteSettingEndDate={this.state.voteSettingEndDate}
                            voteStartDate={this.state.voteStartDate}
                            voteEndDate={this.state.voteEndDate}
                  />      
                  </Route>
                </Switch>
                  }
      </div>
      </Router>
    );
  }
}

export default App;
