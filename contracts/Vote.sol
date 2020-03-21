pragma solidity >=0.4.21 <0.7.0;

//pragma solidity ^0.5.0;


contract Vote {
    string public voteName;
    
    uint256 public addCandidateStartDate;
    uint256 public addCandidateEndDate;
    uint256 public voteStartDate;
    uint256 public voteEndDate;
    
    // deployer decide who can vote
    // deployer decide the stock of each Voter
    address public voteDeployer;
    
    // how many people are in the cadidate map
    uint public totalCandidateNumber = 0;
    
    // how many people can be nominated
    uint maxNominatedNum;
    
    // vote type should be straight voting or cumulative voting
    // 1-> straight voting
    // 2-> cumulative voting
    uint voteType=1;
    
    // should decide the total stock
    // should decide the threshold of the max stock of a Voter
    // the stock cannot be changed after the deployer confirms
    uint totalShareNum;
    uint maxShareNum;
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
        uint voteTime; // how many times I have changed my voted
        uint stock;
        uint totalVoteNum; // how many votes do I have
        uint voteUsed; // how many votes do I use
        uint numOfPeopleNominated; //  how many people do I nominate
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
// 4. if it's cumulative voting, then every voter can have voteNum = stock*maxNominatedNum, and voter can freely distrubute his votes

    constructor(uint256 _addStartDate, uint256 _addEndDate, uint256 _startDate, uint256 _endDate, uint256 _maxNominatedNum,uint256 _totalShareNum, uint256 _maxShareNum, uint _voteType) public {
        voteName = "block chain vote app";
        addCandidateStartDate = _addStartDate;
        addCandidateEndDate = _addEndDate;
        voteStartDate = _startDate;
        voteEndDate = _endDate;
        voteType = _voteType;
        maxNominatedNum= _maxNominatedNum;
        voteDeployer = msg.sender;
        totalShareNum = _totalShareNum;
        maxShareNum = _maxShareNum;
    }
    
    
    
    
   // this func create a new candidate
   // name and info of candidate must be not null
   // default candidate photo url is: https://en.wikipedia.org/wiki/Anonymous_(group)#/media/File:Anonymous_emblem.svg
   // the current time is the value returned by JS func:
   // let date = (new Date()).getTime();
   //let currentDate = date / 1000; 
   // current time shoulb be within the creating new cadidate period
   // cumulativevoting
    function createNewCandidate(string memory _cadidateName, string memory _candidatePhoto, string memory _cadidateInfo, uint256 _currentDate) public{
        require(msg.sender == voteDeployer, "You can't create new cadidate. Only deployer can do this.");
        require(_currentDate > addCandidateStartDate && _currentDate < addCandidateEndDate, "The stage for adding new candiddate is not valid, no candidate can be added");
        require(bytes(_cadidateName).length > 0, "candidate name is required");
        require(bytes(_cadidateInfo).length > 0, "candidate Info is required");
        totalCandidateNumber++;
        string memory photo = "https://en.wikipedia.org/wiki/Anonymous_(group)#/media/File:Anonymous_emblem.svg";
        if(bytes(_candidatePhoto).length > 0){photo = _candidatePhoto;}
        candidates[totalCandidateNumber] = Candidate(totalCandidateNumber,_cadidateName,photo,_cadidateInfo,0);
        emit addCandidate(totalCandidateNumber,_cadidateName,photo,_cadidateInfo,0);
    }
    
    
    // this func destribute the share
    // the share of one voter should not greater than max share
    // the current total share should not greater than total share available
    // so the vote number should be share*maxNominatedNum if it's cumulative
    function allocateShare(address _voterAddr, uint _stockNum) public{
        require(msg.sender == voteDeployer, "You can't deploy stock.Only deployer can do this.");
        require(_stockNum <= maxShareNum, "You can't deploy this many stock for this voter.");
        require((currentTotalShareNum+_stockNum) <= totalShareNum, "You can't deploy more stock, current stock are greater than total stock.");
        
        // add to currentTotalShareNum
        currentTotalShareNum = currentTotalShareNum+_stockNum;
        
        Voter memory _voter =  voters[_voterAddr];
        
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
    // the current time is the value returned by JS func:
    // let date = (new Date()).getTime();
    //let currentDate = date / 1000; 
    // current time should be within the voting period
    // if voter has not voted before, then he can vote
    // if voter has voted before but voting modifying times < 4 then he can vote again
    // if numOfPeopleNominated < maxNominatedNum he can voteForCandidate
    //if voter has stock he can voteForCandidate
    // if voter still has votes left he can vote
    function voteForCandidate(uint _candidateId, uint _voteNum, uint256 _currentDate) public{
        require(_currentDate > voteStartDate && _currentDate < voteEndDate, "The stage for voting is not valid, no vote can be created");       
        require(_candidateId > 0 && _candidateId <= totalCandidateNumber, 'Candidate invalid');
        require(voters[msg.sender].hasVoted == false || voters[msg.sender].voteTime < 3, 'You have access your max voting modifying times(3 times)');
        require(voters[msg.sender].stock > 0 , "You don't have any stock. You can't vote");
        require(voters[msg.sender].numOfPeopleNominated <= maxNominatedNum , "You can't vote for any more nominator. You can't vote");
        
        
        // get the last voting info
        Voter memory _voter =  voters[msg.sender];
        // still has votes left?
        if(voteType==1){
            require(_voter.voteUsed+voters[msg.sender].stock <= _voter.totalVoteNum, "You don't have so many votes");
        }else{
            require(_voter.voteUsed+_voteNum <= _voter.totalVoteNum, "You don't have so many votes");
        }

        bool votedForCandidate = false;
        for(uint i=0;i<=voters[msg.sender].numOfPeopleNominated;i++){
            emit lookForInfo(voters[msg.sender].myVote[i].candidateId,_candidateId);
            if(voters[msg.sender].myVote[i].candidateId == _candidateId){
                votedForCandidate = true;
             }
        }
        require(!votedForCandidate,"You have voted for this candidate. If you want to change, then use changeMyVote()");
           

       
    // then lets input the new voting info
        voters[msg.sender].numOfPeopleNominated++;
        voters[msg.sender].hasVoted = true;
        
        if(voteType==1){
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
        }else{
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
    
    // this func can let you look up the vote record according to recordID
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
    // this func won't change the numOfPeopleNominated
    function changeMyVote(uint _candidateId, uint _newVote, uint _voteInfoNum, uint256 _currentDate) public{
        require(_currentDate > voteStartDate && _currentDate < voteEndDate, "The stage for voting is not valid, no vote can be created");       
        require(_candidateId > 0 && _candidateId <= totalCandidateNumber, 'Candidate invalid');
        require(voters[msg.sender].hasVoted == true && voters[msg.sender].voteTime < 3, 'You have access your max voting modifying times(3 times)');
        require(voters[msg.sender].myVote[_voteInfoNum-1].voteNum > 0, "voting info ID is wrong, you haven't voted for this person");
        
        // get the last voting info
        Voter memory _voter = voters[msg.sender];

        OneVote memory _voteToModify =  voters[msg.sender].myVote[_voteInfoNum-1];
        emit lookForInfo(_voteToModify.candidateId,_voteToModify.voteNum);

        // total voteUsed checking
        if(voteType==2){
            uint myLastVoteNum = _voteToModify.voteNum;
            require(_voter.voteUsed-myLastVoteNum+_newVote<= _voter.totalVoteNum, "You don't have so many votes");
        }else{
            // if you have vote for this candidate then don't vote, cuz in type 1 every candidate can only be voted once
            bool votedForCandidate = false;
           for(uint i=0;i<=voters[msg.sender].numOfPeopleNominated;i++){
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
         _lastVoteCadidate.candidateTotalVote  -= _voteToModify.voteNum;
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