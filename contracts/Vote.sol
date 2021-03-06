pragma solidity >=0.4.21 <0.7.0;
import "./DateTime.sol";

contract Vote {
    string public voteName;
    uint256 public voteEndDate;
    address public voteDeployer;            // deployer decide who can vote and stock of each Voter
    uint public totalCandidateNumber = 0;   // how many people are in the cadidate map
    uint public maxNominatedNum;                   // how many people can be nominated
    DateTime dateTime;
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
    mapping(uint => ContractDate) public contractDates;
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
        uint voteChangeNum;         // how many times I have changed my voted
        uint stock;                 // is share the voter has
        uint totalVoteNum;          // how many votes do I have
        uint voteUsed;              // how many votes do I use
        uint numOfPeopleNominated;  // how many people do I nominate
        mapping (uint => OneVote) myVote; // record for all the nominator I voted
        bool hasVoted;
    }

    struct ContractDate {
        uint year;
        uint month;
        uint day;
    }
    event allocateShareEvent(
        address voter,
        uint stock
    );
    event newVoteRecord(
        uint candidateId,
        uint voteNum
    );
    event changeVoteRecord(
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
    event errorMessage(
        string errMsg
    );
// voting process
// 1. define the candidate, candidate modifying period, voting period, max Nominating Num, total stock, max stock, and voting type
// 2. deployer allocate the share of each voters, voter without any share cannot vote
// 3. if it's straight voting, then every valid voter can have one vote per share for each nominator
//    e.g. The voting have 10 candidate, the voting need to select 3 of them to be in board of directors.
//          Voter Ben has 20 stock thus, he can nominate 3 people, and all these three will have 20 votes
// 4. if it's cumulative voting, then every voter can have voteNum = stock * maxNominatedNum, and voter can freely distrubute his votes

    constructor(uint256 _maxNominatedNum, uint256 _totalShareNum, uint256 _maxShareNum, uint _voteType) public {
        voteName = "block chain vote app";
        maxNominatedNum = _maxNominatedNum;
        totalShareNum = _totalShareNum;
        maxShareNum = _maxShareNum;
        voteType = _voteType;
        voteDeployer = msg.sender;
        dateTime = new DateTime();
        contractDateSetting(0, dateTime.getYear(now), dateTime.getMonth(now), dateTime.getDay(now));
    }
   // this func create a new candidate, only deployer can call this func
   // name and info of candidate must be not null
   // default candidate photo url is: https://en.wikipedia.org/wiki/Anonymous_(group)#/media/File:Anonymous_emblem.svg
   // future direction: the current time is the value returned by JS func:
   // 1.let date = (new Date()).getTime();
   // 2.let currentDate = date / 1000;
   // current time should be within the creating new cadidate period
    function createNewCandidate(string memory _cadidateName, string memory _candidatePhoto,
                                string memory _cadidateInfo) public {
        if(msg.sender != voteDeployer) {
            emit errorMessage("You can't create new cadidate. Only deployer can do this.");
            return;
        }
        require(msg.sender == voteDeployer, "You can't create new cadidate. Only deployer can do this.");
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
    // the currentTotalShareNum + _stockNum should not greater than total share available
    function allocateShare(address _voterAddr, uint _shareNum) public {
        if(msg.sender != voteDeployer) {
            emit errorMessage("You can't deploy share. Only deployer can do this.");
            return;
        }
        require(msg.sender == voteDeployer, "You can't deploy share. Only deployer can do this.");
        if(_shareNum > maxShareNum){
            emit errorMessage("You can't deploy this share because it is over max share per person.");
            return;
        }
        require(_shareNum <= maxShareNum, "You can't deploy this stock number for this voter.");
        if((currentTotalShareNum + _shareNum) > totalShareNum) {
            emit errorMessage("You can't deploy more share, current share is over total share limit.");
            return;
        }
        require((currentTotalShareNum + _shareNum) <= totalShareNum,
        "You can't deploy more share, current share is over total share limit.");
        //add to currentTotalShareNum
        currentTotalShareNum = currentTotalShareNum + _shareNum;
        Voter memory _voter = voters[_voterAddr];
        _voter.stock = _shareNum;
        _voter.totalVoteNum = _shareNum * maxNominatedNum;
        voters[_voterAddr] = _voter;
        emit allocateShareEvent(_voterAddr, _shareNum);
    }
    // this func let voter vote for a candidate
    // _candidateId: the candidate you want to vote
    // _voteNum: the number of votes
    // _currentDate: future direction, the current time is the value returned by JS func:
    // 1.let date = (new Date()).getTime();
    // 2.let currentDate = date / 1000;
    // basic logic
    // current time should be within the voting period
    // if voter has not voted before, then he can vote
    // if numOfPeopleNominated < maxNominatedNum then he can voteForCandidate
    // if voter has stock then he can voteForCandidate
    // if voter still has votes left he can vote

    function voteForCandidate(uint _candidateId, uint _voteNum) public {
        if(_candidateId < 0 || _candidateId > totalCandidateNumber) {
            emit errorMessage("Invalid Candidate Id.");
            return;
        }
        require(_candidateId > 0 && _candidateId <= totalCandidateNumber, "Invalid Candidate Id.");
        if(voters[msg.sender].stock <= 0) {
            emit errorMessage("You don't have any share. You can't vote.");
            return;
        }
        require(voters[msg.sender].stock > 0, "You don't have any share. You can't vote.");
        if(voters[msg.sender].numOfPeopleNominated > maxNominatedNum) {
            emit errorMessage("You can't vote for any more nominator. You can't vote.");
            return;
        }
        require(voters[msg.sender].numOfPeopleNominated <= maxNominatedNum,
        "You can't vote for any more nominator. You can't vote.");
        // get the last voting info
        Voter memory _voter = voters[msg.sender];
        // still has votes left?
        if(voteType == 1){
            if(_voter.voteUsed + voters[msg.sender].stock > _voter.totalVoteNum) {
                emit errorMessage("You don't have enough votes.");
                return;
            }
            require(_voter.voteUsed + voters[msg.sender].stock <= _voter.totalVoteNum,
            "You don't have enough votes.");
        } else {
            if(_voter.voteUsed + _voteNum > _voter.totalVoteNum) {
                emit errorMessage("You don't have enough votes.");
                return;
            }
            require(_voter.voteUsed + _voteNum <= _voter.totalVoteNum, "You don't have enough votes.");
        }
        // check wether you have voted for this candidates or not
        bool votedForCandidate = false;
        for(uint i = 0; i <= voters[msg.sender].numOfPeopleNominated; i++){
            //emit lookForInfo(voters[msg.sender].myVote[i].candidateId, _candidateId);
            if(voters[msg.sender].myVote[i].candidateId == _candidateId){
                votedForCandidate = true;
             }
        }
        if(votedForCandidate) {
            emit errorMessage("You have voted for this candidate.");
            return;
        }
        require(!votedForCandidate,
            "You have voted for this candidate.");
         // then lets input the new voting info
        voters[msg.sender].numOfPeopleNominated++;
        voters[msg.sender].hasVoted = true;
        uint currentVoteStock;
        if(voteType == 1) {
            currentVoteStock = voters[msg.sender].stock;
        } else {
            currentVoteStock = _voteNum;
        }
        OneVote memory myNewVote = OneVote(_candidateId, currentVoteStock);
        voters[msg.sender].myVote[_voter.numOfPeopleNominated] = myNewVote;
        voters[msg.sender].voteUsed += currentVoteStock;

        Candidate memory _cadidate = candidates[_candidateId];
        _cadidate.candidateTotalVote += currentVoteStock;
        candidates[_candidateId] = _cadidate;

        emit newVoteRecord(_candidateId, currentVoteStock);
    }
    // this func can let you look up all the vote records
    function lookUpVoteRecord() public{
        uint num_p = voters[msg.sender].numOfPeopleNominated;
        if(num_p == 0) {
            emit errorMessage("You have not voted for any candidates yet, no vote record.");
            return;
        }
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
    function changeMyVote(uint _candidateId, uint _newVote, uint _voteInfoNum) public {
        if(_candidateId < 0 || _candidateId > totalCandidateNumber) {
            emit errorMessage("Invalid Candidate Id.");
            return;
        }
        require(_candidateId > 0 && _candidateId <= totalCandidateNumber, "Invalid Candidate Id.");
        if(voters[msg.sender].hasVoted == false) {
            emit errorMessage("You have not voted any candidates.");
            return;
        }
        if(voters[msg.sender].voteChangeNum >= 3) {
            emit errorMessage("You have access your max vote modifying times(3 times).");
            return;
        }
        require(voters[msg.sender].hasVoted == true && voters[msg.sender].voteChangeNum < 3,
        "You have access your max vote modifying times(3 times).");
        if(voters[msg.sender].myVote[_voteInfoNum - 1].voteNum <= 0) {
            emit errorMessage("Voting info ID is wrong, you haven't voted for this candidate.");
            return;
        }
        require(voters[msg.sender].myVote[_voteInfoNum - 1].voteNum > 0,
        "Voting info ID is wrong, you haven't voted for this candidate.");
        // get the last voting info
        Voter memory _voter = voters[msg.sender];
        OneVote memory _voteToModify = voters[msg.sender].myVote[_voteInfoNum - 1];
        // emit lookForInfo(_voteToModify.candidateId, _voteToModify.voteNum);
        // total voteUsed checking
        if(voteType == 2) {
            uint myLastVoteNum = _voteToModify.voteNum;
            if(_voter.voteUsed - myLastVoteNum + _newVote > _voter.totalVoteNum) {
                emit errorMessage("You don't have enough votes.");
                return;
            }
            require(_voter.voteUsed - myLastVoteNum + _newVote <= _voter.totalVoteNum, "You don't have enough votes.");
        } else {
            // if you have vote for this candidate then don't vote, cuz in type 1 every candidate can only be voted once
           bool votedForCandidate = false;
           for(uint i = 0; i <= voters[msg.sender].numOfPeopleNominated; i++){
                //emit lookForInfo(voters[msg.sender].myVote[i].candidateId,_candidateId);
                if(voters[msg.sender].myVote[i].candidateId == _candidateId && voters[msg.sender].myVote[i].voteNum > 0) {
                    votedForCandidate = true;
                }
           }
           if(votedForCandidate) {
                emit errorMessage("You have voted for this candidate.");
                return;
           }
           require(!votedForCandidate, "You have voted for this candidate.");
        }
        // now start to modify
        voters[msg.sender].voteChangeNum++;
        // last candidate I vote
        Candidate memory _lastVoteCandidate = candidates[_voteToModify.candidateId];
         // retrieve the voteNumUsed and the candidate voteNum
         _lastVoteCandidate.candidateTotalVote -= _voteToModify.voteNum;
         candidates[_voteToModify.candidateId] = _lastVoteCandidate;
         voters[msg.sender].voteUsed -= _voteToModify.voteNum;
         // now input the new vote info
        uint currentVoteNum;
        if(voteType == 1) {
            currentVoteNum = voters[msg.sender].stock;
        } else {
            currentVoteNum = _newVote;
        }
        OneVote memory myNewVote = OneVote(_candidateId, currentVoteNum);
        voters[msg.sender].voteUsed += currentVoteNum;
        voters[msg.sender].myVote[_voteInfoNum - 1] = myNewVote;
        Candidate memory _cadidate = candidates[_candidateId];
        _cadidate.candidateTotalVote += currentVoteNum;
        candidates[_candidateId] = _cadidate;
        emit changeVoteRecord(_candidateId, currentVoteNum);
    }

    function contractDateSetting(uint _index, uint _year, uint _month, uint _day) public {
        if(_index == 0) {
            for(uint i = 1; i <= 4; i++){
                contractDates[i] = ContractDate(_year, _month, _day);
            }
        } else {
            ContractDate memory _contractDate = contractDates[_index];
            _contractDate.year = _year;
            _contractDate.month = _month;
            _contractDate.day = _day;
            contractDates[_index] = _contractDate;
        }
        emit errorMessage("Date Change Finished!");
    }

    function changeVoteType() public {
        if (voteType == 1) {
            voteType = 2;
        } else {
            voteType = 1;
        }
        emit errorMessage("Vote Type Change Finished!");
    }
}