import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import Can from './Can';
import CustomDate from './CustomDate';
import VoteContract from "./contracts/Vote.json";
import canRawData from "./data/candidates.json";
import "./App.css";



class App extends Component {
  constructor(props) {
    super(props);
    //read candidate image and information from Json file
    const requireContext = require.context("./data/images",true, /^\.\/.*\.jpg$/);
    const canImages = requireContext.keys().map(requireContext);

    this.state = { 
      web3: null, 
      accounts: null, 
      voteContract: null, 
      candidates: [],
      canStateImages: null, 
      canStateData: null 
    }

    this.state = { canStateImages: canImages, canStateData: canRawData, candidates: [] };
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3(); 

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VoteContract.networks[networkId];
      const voteContractInstance = new web3.eth.Contract(VoteContract.abi, deployedNetwork.address);

      // Set web3, accounts, and contract to the state
      this.setState({ web3, accounts, voteContract: voteContractInstance });

      const voteName = await voteContractInstance.methods.voteName().call();
      console.log(voteName);

      const candidatesCount = await voteContractInstance.methods.candidatesCount().call();
      console.log(candidatesCount);


      //If there is no candidate data in blockchain, read from Json
      if(candidatesCount == 0){
          const promises = this.state.canStateData.map(async data => {
            const canTmp = await voteContractInstance.methods.createCandidate(data.name, 
              data.age, data.party).send({from: accounts[0]});
            return canTmp
          })
          await Promise.all(promises)
      }

      //copy candiddates info. from blockchain to local
      for (let j = 1; j <= candidatesCount; j++) {
        const candidate = await voteContractInstance.methods.candidates(j).call();
        const candidates = this.state.candidates;
        candidates.push({
          id: candidate[0],
          name: candidate[1],
          age: candidate[2],
          party: candidate[3],
          voteCount: candidate[4]
        });
        this.setState({ candidates: candidates })
      }

      console.log(this.state.candidates);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  voteForCandidate = async (_candidateId) => {
    await this.state.voteContract.methods.vote(_candidateId).send({from: this.state.accounts[0]})
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
