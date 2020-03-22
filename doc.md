# Blockchain Global Voting System

## Introduction

From the US presidential election to student association resolution, voting is a common but indispensable activity in our daily life. However, the traditional voting systems, either on-site or online, always have some disadvantages because of their natural form and restrictions using traditional technologies. In this project, we designed the smart contract and implemented a voting system using blockchain technology. By applying the two most important features, cryptography and decentralization, the security and reliability of the voting process is guaranteed.

## Disadvantages of Traditional On-Site Voting

-   People need to go to the voting polls in person and wait in a long line. (Persidential Election)
-   Impossible to alter vote before the deadline if the voters change their mind.
-   Hackers can apply malicious attack the back-end server/database and manipulate the results.

## Advantages of Online Voting through Blockchain

-   The voting results are outgiving and immutable.
-   The decentralized network can help prevent malicious attack.
-   People can vote anywhere where the Internet is accessible.
-   People have the authority to alter their vote before the deadline in case that they change their mind.
-   Real-time voting results are always visible to everyone.

## Objectives

The functionalities of our voting system are divided into 3 parts, from basic to advanced based on the importance of these functions to the system. Some of the advanced functionalies may not be able to finish before the deadline but we guarantee that all the basic and itermediate functions will be implemented.

### Basic Functions

#### Vote

There are two kinds of voting - straight and cumulative. In the straight voting, each voter can have one vote per share for each nominator. In other words, voters only need to select the candidates they intend to vote for. If it is a cumulative voting, each voter can allocate their shareholders over these candidates. There are several constraints on voting. For example, the voter should always vote before the deadline and should have never voted before. Besides, the candidates should be valid as well.

#### Inquire

Inquire allows users to check and change their decision. The voting result is always visible to all the voters and everyone can check others' choices. However, only the voter himself/herself has the authority to change the decision up to three times. The security and authority is guaranteed by the blockchain.

#### Results

Results show the real-time vote rate of each candidate in the form of a histogram.

### Intermediate Functions

#### Candidate Creation

A candidate is created by filling in name and other information, as well as a time by when the candidate is created.

#### Voting Deadline

A voting deadline is a reference to indicate that all the voters made after the deadline will be declined.

### Advanced Functions

#### New Voting Creation

This functionality allows proposing a new voting. It can set the name of this voting, the candidate instances, as well as the voting deadline.



![image-20200322113059007](/Users/lijiahao/Library/Application Support/typora-user-images/image-20200322113059007.png)

## Application Wireframe

## Smart Contract

```javascript
pragma solidity >=0.4.21 <0.7.0;

contract Vote {
    string public voteName;
    uint256 public addCandidateStartDate;
    uint256 public addCandidateEndDate;
    uint256 public voteStartDate;
    uint256 public voteEndDate;
    address public voteDeployer;            // deployer decide who can vote and stock of each Voter
    uint public totalCandidateNumber = 0;   // how many people are in the cadidate map
    uint public maxNominatedNum;                   // how many people can be nominated
    // vote type should be straight voting or cumulative voting
    // 1-> straight voting
    // 2-> cumulative voting
    uint public voteType = 1;
    // should decide the total stock
    // should decide the threshold of the max stock of a Voter
    // the stock cannot be changed after the deployer confirms
    uint public totalShareNum;
    uint public maxShareNum;
    uint public currentTotalShareNum = 0;
    // deployer should confirm when finish deploying the stock
    bool comfirm = false;
    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;
    struct Candidate {
        uint candidateId;
        string candidateName;
        string candidatePhoto;
        string candidateInfo;
        uint candidateTotalVote;
    }

    struct OneVote {
        uint candidateId;
        uint voteNum;
    }

    struct Voter{
        uint voteTime;              // how many times I have changed my voted
        uint stock;
        uint totalVoteNum;          // how many votes do I have
        uint voteUsed;              // how many votes do I use
        uint numOfPeopleNominated;  //  how many people do I nominate
        mapping (uint => OneVote) myVote; // record for all the nominator I voted
        bool hasVoted;
    }
    event allocateStock(
        address voter,
        uint stock
    );
    event newVoteRecord(
        uint candidateId,
        uint voteNum
    );
    event lookForInfo(
        uint candidateId,
        uint inputId
    );
    event addCandidate(
        uint candidateId,
        string candidateName,
        string candidatePhoto,
        string candidateInfo,
        uint candidateTotalVote
    );
    event vote(
        uint voteName,
        uint voteTime,
        bool hasVoted
    );
    event lookUpMyVote(
        address myAddr,
        uint[] recordID,
        uint[] candidateID,
        uint[] voteNum
        );
// voting process
// 1. define the candidate, candidate modifying period, voting period, max Nominating Num, total stock, max stock, and voting type
// 2. deployer allocate the share of each voters, voter without any share cannot vote
// 3. if it's straight voting, then every valid voter can have one vote per share for each nominator
//    e.g. The voting have 10 candidate, the voting need to select 3 of them to be in board of directors.
//          Voter Ben has 20 stock thus, he can nominate 3 people, and all these three will have 20 votes
// 4. if it's cumulative voting, then every voter can have voteNum = stock * maxNominatedNum, and voter can freely distrubute his votes

    constructor(uint256 _addStartDate, uint256 _addEndDate, uint256 _startDate, uint256 _endDate,
                uint256 _maxNominatedNum, uint256 _totalShareNum, uint256 _maxShareNum, uint _voteType) public {
        voteName = "block chain vote app";
        addCandidateStartDate = _addStartDate;
        addCandidateEndDate = _addEndDate;
        voteStartDate = _startDate;
        voteEndDate = _endDate;
        voteType = _voteType;
        maxNominatedNum = _maxNominatedNum;
        voteDeployer = msg.sender;
        totalShareNum = _totalShareNum;
        maxShareNum = _maxShareNum;
    }
   // this func create a new candidate, only deployer can call this func
   // name and info of candidate must be not null
   // default candidate photo url is: https://en.wikipedia.org/wiki/Anonymous_(group)#/media/File:Anonymous_emblem.svg
   // future direction: the current time is the value returned by JS func:
   // 1.let date = (new Date()).getTime();
   // 2.let currentDate = date / 1000;
   // current time should be within the creating new cadidate period
    function createNewCandidate(string memory _cadidateName, string memory _candidatePhoto,
                                string memory _cadidateInfo, uint256 _currentDate) public {
        require(msg.sender == voteDeployer, "You can't create new cadidate. Only deployer can do this.");
        require(_currentDate > addCandidateStartDate && _currentDate < addCandidateEndDate,
                "The stage for adding new candiddate is not valid, no candidate can be added");
        require(bytes(_cadidateName).length > 0, "candidate name is required");
        require(bytes(_cadidateInfo).length > 0, "candidate info is required");
        totalCandidateNumber++;
        string memory photo = "https://en.wikipedia.org/wiki/Anonymous_(group)#/media/File:Anonymous_emblem.svg";
        if(bytes(_candidatePhoto).length > 0){photo = _candidatePhoto;}
        candidates[totalCandidateNumber] = Candidate(totalCandidateNumber,_cadidateName,photo,_cadidateInfo,0);
        emit addCandidate(totalCandidateNumber,_cadidateName,photo,_cadidateInfo,0);
    }
    // this func allocate the share to one shareholder, only deployer can call this func
    // the share of one voter should not greater than max share amount that a voter can hold
    // the currentTotalShareNum+_stockNum should not greater than total share available
    function allocateShare(address _voterAddr, uint _stockNum) public{
        require(msg.sender == voteDeployer, "You can't deploy stock.Only deployer can do this.");
        require(_stockNum <= maxShareNum, "You can't deploy this many stock for this voter.");
        require((currentTotalShareNum+_stockNum) <= totalShareNum, "You can't deploy more stock, current stock are greater than total stock.");
        // add to currentTotalShareNum
        currentTotalShareNum = currentTotalShareNum+_stockNum;
        Voter memory _voter = voters[_voterAddr];
        _voter.stock = _stockNum;
        _voter.totalVoteNum = _stockNum*maxNominatedNum;
        // if(voteType==1){
        //     _voter.totalVoteNum = _stockNum;
        // }else{
        //     _voter.totalVoteNum = _stockNum*maxNominatedNum;
        // }
        voters[_voterAddr] = _voter;
        emit allocateStock(_voterAddr,_stockNum);
    }
    // this func let voter vote for a candidate
    //_candidateId: the candidate you want to vote
    //_voteNum: the number of votes
    // _currentDate: future direction, the current time is the value returned by JS func:
    // 1.let date = (new Date()).getTime();
    // 2.let currentDate = date / 1000;
    //basic logic
    // current time should be within the voting period
    // if voter has not voted before, then he can vote
    // if numOfPeopleNominated < maxNominatedNum then he can voteForCandidate
    // if voter has stock then he can voteForCandidate
    // if voter still has votes left he can vote

    function voteForCandidate(uint _candidateId, uint _voteNum, uint256 _currentDate) public{
        require(_currentDate > voteStartDate && _currentDate < voteEndDate,
        "The stage for voting is not valid, no vote can be created");
        require(_candidateId > 0 && _candidateId <= totalCandidateNumber, 'Candidate invalid');
        require(voters[msg.sender].hasVoted == false || voters[msg.sender].voteTime < 3,
        'You have access your max voting modifying times(3 times)');
        require(voters[msg.sender].stock > 0, "You don't have any stock. You can't vote");
        require(voters[msg.sender].numOfPeopleNominated <= maxNominatedNum, "You can't vote for any more nominator. You can't vote");
        // get the last voting info
        Voter memory _voter = voters[msg.sender];
        // still has votes left?
        if(voteType==1){
            require(_voter.voteUsed+voters[msg.sender].stock <= _voter.totalVoteNum, "You don't have so many votes");
        }else{
            require(_voter.voteUsed+_voteNum <= _voter.totalVoteNum, "You don't have so many votes");
        }

        bool votedForCandidate = false;
        for(uint i = 0;i <= voters[msg.sender].numOfPeopleNominated; i++){
            emit lookForInfo(voters[msg.sender].myVote[i].candidateId,_candidateId);
            if(voters[msg.sender].myVote[i].candidateId == _candidateId){
                votedForCandidate = true;
             }
        }
        require(!votedForCandidate, "You have voted for this candidate. If you want to change, then use changeMyVote()");
         // then lets input the new voting info
        voters[msg.sender].numOfPeopleNominated++;
        voters[msg.sender].hasVoted = true;
        if(voteType==1) {
            // straight
            //vote num = stock num
            OneVote memory myNewVote = OneVote(_candidateId,voters[msg.sender].stock);
            voters[msg.sender].myVote[_voter.numOfPeopleNominated] = myNewVote;
            emit newVoteRecord(voters[msg.sender].myVote[_voter.numOfPeopleNominated].candidateId,voters[msg.sender].myVote[_voter.numOfPeopleNominated].voteNum);
            voters[msg.sender].voteUsed += voters[msg.sender].stock;
            //voters[msg.sender] = Voter(_voter.voteTime,_voter.stock,_voter.totalVoteNum,_voter.voteUsed,_voter.numOfPeopleNominated,myNewVote,true);
            Candidate memory _cadidate = candidates[_candidateId];
            _cadidate.candidateTotalVote += voters[msg.sender].stock;
            candidates[_candidateId] = _cadidate;
        } else {
            // cumulative
            // vote num = _newVote
            OneVote memory myNewVote = OneVote(_candidateId,_voteNum);
             voters[msg.sender].voteUsed += _voteNum;
              voters[msg.sender].myVote[_voter.numOfPeopleNominated] = myNewVote;
           // voters[msg.sender] = _voter;
            Candidate memory _cadidate = candidates[_candidateId];
            _cadidate.candidateTotalVote += _voteNum;
            candidates[_candidateId] = _cadidate;
        }
        emit vote(_candidateId,_voter.voteTime,_voter.hasVoted);
    }
    // this func can let you look up all the vote records
    function lookUpVoteRecord() public{
        uint num_p = voters[msg.sender].numOfPeopleNominated;
        uint256[] memory recordID = new uint256[](num_p);
        uint256[] memory candidateID = new uint256[](num_p);
        uint256[] memory voteNum = new uint256[](num_p);
        for(uint _recordId = 0;_recordId < num_p;_recordId++){
            recordID[_recordId] = _recordId;
            candidateID[_recordId] = voters[msg.sender].myVote[_recordId].candidateId;
            voteNum[_recordId] = voters[msg.sender].myVote[_recordId].voteNum;
        }
        emit lookUpMyVote(msg.sender,recordID,candidateID,voteNum);
     }
    // this func change the EXISTING record in myVote struct.
    //_candidateId: the new candidate you want to vote
    //_newVote: num of votes
    //_voteInfoNum: the voting record you want to edit
    // _currentDate: future direction. For now it will be a constant input
    //basic logic
    // it will first retrieve the vote you want to modify
    // then it will deduct the votes from the previous candidate you vote
    // after that it will add the vote to the new candidate you want to vote
    // this func won't change the numOfPeopleNominated
    function changeMyVote(uint _candidateId, uint _newVote, uint _voteInfoNum, uint256 _currentDate) public{
        require(_currentDate > voteStartDate && _currentDate < voteEndDate, "The stage for voting is not valid, no vote can be created");
        require(_candidateId > 0 && _candidateId <= totalCandidateNumber, 'Candidate invalid');
        require(voters[msg.sender].hasVoted == true && voters[msg.sender].voteTime < 3, 'You have access your max voting modifying times(3 times)');
        require(voters[msg.sender].myVote[_voteInfoNum-1].voteNum > 0, "voting info ID is wrong, you haven't voted for this person");
        // get the last voting info
        Voter memory _voter = voters[msg.sender];
        OneVote memory _voteToModify = voters[msg.sender].myVote[_voteInfoNum-1];
        emit lookForInfo(_voteToModify.candidateId,_voteToModify.voteNum);
        // total voteUsed checking
        if(voteType==2){
            uint myLastVoteNum = _voteToModify.voteNum;
            require(_voter.voteUsed-myLastVoteNum+_newVote <= _voter.totalVoteNum, "You don't have so many votes");
        }else{
            // if you have vote for this candidate then don't vote, cuz in type 1 every candidate can only be voted once
            bool votedForCandidate = false;
           for(uint i = 0;i <= voters[msg.sender].numOfPeopleNominated;i++){
            emit lookForInfo(voters[msg.sender].myVote[i].candidateId,_candidateId);
            if(voters[msg.sender].myVote[i].candidateId == _candidateId && voters[msg.sender].myVote[i].voteNum > 0){
                votedForCandidate = true;
             }
              require(!votedForCandidate,"You have voted for this candidate.");
            }
        }
        // now start to modify
        voters[msg.sender].voteTime++;
        // last candidate I vote
        Candidate memory _lastVoteCadidate = candidates[_voteToModify.candidateId];
         // retrieve the voteNumUsed and the candidate voteNum
         _lastVoteCadidate.candidateTotalVote -= _voteToModify.voteNum;
         candidates[_voteToModify.candidateId] = _lastVoteCadidate;
         voters[msg.sender].voteUsed -= _voteToModify.voteNum;
         // now input the new vote info
        if(voteType==1){
            // straight
            //vote num = stock num
            OneVote memory myNewVote = OneVote(_candidateId,voters[msg.sender].stock);
            voters[msg.sender].voteUsed += voters[msg.sender].stock;
            voters[msg.sender].myVote[_voteInfoNum-1] = myNewVote;
            Candidate memory _cadidate = candidates[_candidateId];
            _cadidate.candidateTotalVote += voters[msg.sender].stock;
            candidates[_candidateId] = _cadidate;
        }else{
            // cumulative
            // vote num = _newVote
            OneVote memory myNewVote = OneVote(_candidateId,_newVote);
            voters[msg.sender].voteUsed += _newVote;
            voters[msg.sender].myVote[_voteInfoNum-1] = myNewVote;
            Candidate memory _cadidate = candidates[_candidateId];
            _cadidate.candidateTotalVote += _newVote;
            candidates[_candidateId] = _cadidate;
        }
    }
}
```

## Testing

```javascript
const Vote = artifacts.require("./Vote.sol");

contract("Vote Test", async accounts => {
    var vote;
    before(async()=>{
        vote = await Vote.deployed();
    });

    describe('initializes the vote contract', async () => {
        it('get vote name', async () => {
            let voteName = await vote.voteName();
            assert.equal(voteName, 'block chain vote app');
        });

        it('get add candidate start and end date', async () => {
            let startDate = await vote.addCandidateStartDate();
            let endDate = await vote.addCandidateEndDate();
            assert.equal(startDate.toNumber(), 100);
            assert.equal(endDate.toNumber(), 200);
        });

        it('get add vote start and end date', async () => {
            let startDate = await vote.voteStartDate();
            let endDate = await vote.voteEndDate();
            assert.equal(startDate.toNumber(), 300);
            assert.equal(endDate.toNumber(), 400);
        });

        it('get vote type, max nominated number and vote deployer', async () => {
            let voteType = await vote.voteType();
            let maxNominatedNum = await vote.maxNominatedNum();
            let address = await vote.voteDeployer();
            assert.equal(address, accounts[0]);
            assert.equal(maxNominatedNum.toNumber(), 5);
        });

        it('get total share and max share per person', async () => {
            let totalShareNum = await vote.totalShareNum();
            let maxShareNum = await vote.maxShareNum();
            assert.equal(totalShareNum.toNumber(), 100);
            assert.equal(maxShareNum.toNumber(), 50);
        });
    });


    describe('create candidates in contract', async () => {
        it('create a candidate with complete information', async () => {
            let result1 = await vote.createNewCandidate('Kobe Bryant', 'https://KB.jpg', 'Basketball player', 150,{from: accounts[0]});
            let totalCandidateNumber = await vote.totalCandidateNumber();
            let event1 = result1.logs[0].args;
            assert.equal(event1.candidateId.toNumber(), totalCandidateNumber.toNumber(), 'Candidate id is correct');
            assert.equal(event1.candidateName, 'Kobe Bryant','Candidate name is correct');
            assert.equal(event1.candidatePhoto, 'https://KB.jpg','Candidate photo url is correct');
            assert.equal(event1.candidateInfo, 'Basketball player','Candidate info is correct');
            assert.equal(event1.candidateTotalVote.toNumber(), 0,'Candidate vote number is correct');
        });

        it('create a candidate with incomplete information', async () => {
            //invalid candidate name
            try{
                await await vote.createNewCandidate('', 'https://KB.jpg', 'Basketball player', 150, {from: accounts[0]});
             }catch(error){
                 assert.equal(error.message.includes('candidate name is required'), true);
             }  

             //invalid candiate info
             try{
                await await vote.createNewCandidate('Kobe Bryant', 'https://KB.jpg', '', 150, {from: accounts[0]});
             }catch(error){
                 assert.equal(error.message.includes('candidate info is required'), true);
             } 

             //invalid add deployer address
             try{
                await await vote.createNewCandidate('Kobe Bryant', 'https://KB.jpg', '', 150, {from: accounts[1]});
             }catch(error){
                 assert.equal(error.message.includes("You can't create new cadidate. Only deployer can do this."), true);
             } 

             //invalid create time
             try{
                await await vote.createNewCandidate('Kobe Bryant', 'https://KB.jpg', 'Basketball player', 300, {from: accounts[0]});
             }catch(error){
                 assert.equal(error.message.includes("The stage for adding new candiddate is not valid, no candidate can be added"), true);
             } 
        });
    });

});
```

## Testing Result

![img](https://lh5.googleusercontent.com/6_C-db_dp5wi0wp5eCmXiQtyMthABsPhArKPqP_bNGqJ9zapbNlK46r8D2vAtVy_vXOYgDEy9EByvkHJPXFxY7BzY24KlKIe9zyECicPHl9vtc8j6CYapiag8XqUlDWTBiTtdfEl)

