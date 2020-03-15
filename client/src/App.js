import React, { Component } from "react";
import Web3 from 'web3';
// import Can from './Can';
// import CustomDate from './CustomDate';
// import VoteContract from "./contracts/Vote.json";
// import canRawData from "./data/candidates.json";
import "./App.css";



class App extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      account: '', // the account here is the account in metamask, so this is why we should reload the page after add an account
      totalNumber: 0,
      candidates: [],
      loading: true
    }

    this.getWeb3Provider = this.getWeb3Provider.bind(this);
    this.connectToBlockchain = this.connectToBlockchain.bind(this);
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
 // get the item info so we can use it to render the table
  async connectToBlockchain(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]})
    const networkId = await web3.eth.net.getId() // get network id from metamask
    const networkData = Ethbay.networks[networkId]; // try use access network id  to access data from ethbay doc
    if(networkData) {
      const deployedEthbay = new web3.eth.Contract(Ethbay.abi, networkData.address); // access the contract, address is the contract address, abi work as a bridge
      this.setState({deployedEthbay: deployedEthbay}); // add the contract to state
      const totalNumber = await deployedEthbay.methods.totalNumber().call(); // call a default function in the contract, cuz totalNUmber is public, so has a getter in default
      console.log(totalNumber);
      this.setState({totalNumber}) // equal to this.setState({totalNumber:totalNumber}), since key:value name is the same
      for (var i = 1;i<= totalNumber;i++) {
        const item = await deployedEthbay.methods.items(i).call(); // get each items info, item is a mapping(addr => Item)
        this.setState({
          items:[...this.state.items, item] // append the item into the existing item array
        });
      }
      this.setState({loading: false})
      console.log(this.state.items)
    } else {
      window.alert('Ethbay contract is not found in your blockchain.')
    }
  
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <p>Your accout address is: {this.state.accounts[0]}</p>
        <Can canData={this.state.candidates} 
             canImages={this.state.canStateImages} 
             voteForCandidate = {this.voteForCandidate}/>
        <br/>
        <CustomDate />
      </div>
    );
  }
}

export default App;
