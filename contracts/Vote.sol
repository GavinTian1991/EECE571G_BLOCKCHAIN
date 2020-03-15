pragma solidity >=0.4.21 <0.7.0;

contract Vote {

    string public voteName;
    uint public candidatesCount;

    struct Candidate {
        uint id;
        string name;
        uint age;
        string party;
        uint voteCount;
    }
    mapping(address => bool) public voters;

    mapping(uint => Candidate) public candidates;

    event createCanEvent (
        uint id,
        string name,
        uint voteCount
    );

    event votedEvent (
        uint id,
        string name,
        uint voteCount
    );

    constructor() public {
        voteName = 'Canadian Vote';
    }

    function createCandidate (string memory _name, uint _age, string memory _party) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _age, _party, 0);
        emit createCanEvent(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender], 'You have already voted.');

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount, 'Not a valid candidate.');

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount++;

        // trigger voted event
        emit votedEvent(_candidateId, candidates[_candidateId].name, candidates[_candidateId].voteCount);
    }
}
