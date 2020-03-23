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
                await vote.createNewCandidate('', 'https://KB.jpg', 'Basketball player', 150, {from: accounts[0]});
             }catch(error){
                 assert.equal(error.message.includes('candidate name is required'), true);
             }  

             //invalid candiate info
             try{
                await vote.createNewCandidate('Kobe Bryant', 'https://KB.jpg', '', 150, {from: accounts[0]});
             }catch(error){
                 assert.equal(error.message.includes('candidate info is required'), true);
             } 

             //invalid add deployer address
             try{
                await vote.createNewCandidate('Kobe Bryant', 'https://KB.jpg', '', 150, {from: accounts[1]});
             }catch(error){
                 assert.equal(error.message.includes("You can't create new cadidate. Only deployer can do this."), true);
             } 

             //invalid create time
             try{
                await vote.createNewCandidate('Kobe Bryant', 'https://KB.jpg', 'Basketball player', 300, {from: accounts[0]});
             }catch(error){
                 assert.equal(error.message.includes("The stage for adding new candiddate is not valid, no candidate can be added"), true);
             } 
        });
    });

    describe('allocate share in contract', async () => {
        it('allocate share to specific address', async () => {
            let result2 = await vote.allocateShare(accounts[1], 10, {from: accounts[0]});
            let event2 = result2.logs[0].args;
            let address = event2.voter;
            assert.equal(address, accounts[1]);
            assert.equal(event2.stock.toNumber(), 10);

            let voter = await vote.voters(address);
            let maxNominatedNum = await vote.maxNominatedNum();
            assert.equal(voter.stock.toNumber(), 10);
            assert.equal(voter.totalVoteNum.toNumber(), 10 * maxNominatedNum.toNumber());
        });

        it('allocate share with invalid inputs', async () => {
            //invalid deployer address
            try{
                await vote.allocateShare(accounts[1], 10, {from: accounts[1]});
            }catch(error){
                assert.equal(error.message.includes("You can't deploy stock. Only deployer can do this."), true);
            }

            //invalid deployer address
            try{
                await vote.allocateShare(accounts[1], 50, {from: accounts[0]});
                await vote.allocateShare(accounts[1], 45, {from: accounts[0]});
            }catch(error){
                assert.equal(error.message.includes("You can't deploy more stock, current stock are greater than total stock."), true);
            } 
        });
    });

    describe('vote for candidates', async () => {
        it('valid vote for candidates under straight type', async () => {
            let result3 = await vote.voteForCandidate(1, 10, 350, {from: accounts[1]});
            let event3 = result3.logs[0].args;  //[0]: look up event
            let voter = await vote.voters(accounts[1]);
            let candidate = await vote.candidates(1);

            assert.equal(voter.numOfPeopleNominated.toNumber(), 1);
            assert.equal(voter.hasVoted, true);
            assert.equal(voter.voteUsed.toNumber(), 50);
            assert.equal(candidate.candidateTotalVote.toNumber(), 50);

            assert.equal(event3.candidateId.toNumber(), 1);
            assert.equal(event3.voteNum.toNumber(), 50);
        });

        it('valid vote for candidates with cumulative vote', async () => {
            await vote.changeVoteType(2);
            let type = await vote.voteType();
            assert.equal(type.toNumber(), 2);
            let curTotalShare = await vote.currentTotalShareNum();
            assert.equal(curTotalShare.toNumber(), 60);

            await vote.allocateShare(accounts[2], 30, {from: accounts[0]});
            let result4 = await vote.voteForCandidate(1, 100, 350, {from: accounts[2]});
            let event4 = result4.logs[0].args;  //[0]: look up event
            let voter = await vote.voters(accounts[1]);
            let candidate = await vote.candidates(1);

            assert.equal(candidate.candidateTotalVote.toNumber(), 150);
            assert.equal(event4.candidateId.toNumber(), 1);
            assert.equal(event4.voteNum.toNumber(), 100);

            await vote.changeVoteType(1);
            type = await vote.voteType();
            assert.equal(type.toNumber(), 1);
        });

        it('invalid vote with wrong input', async () => {
            //invalid vote date
            try{
                await vote.voteForCandidate(1, 100, 450, {from: accounts[2]});
            }catch(error){
                assert.equal(error.message.includes("The stage for voting is not valid, no vote can be created"), true);
            }
            //invalid vote candidate id
            try{
                await vote.voteForCandidate(2, 100, 350, {from: accounts[2]});
            }catch(error){
                assert.equal(error.message.includes("Invalid Candidate Id"), true);
            }
            //account with no share
            try{
                await vote.voteForCandidate(1, 100, 350, {from: accounts[3]});
            }catch(error) {
                assert.equal(error.message.includes("You don't have any share. You can't vote"), true);
            }
            //exceed total vote number
            try{
                await vote.changeVoteType(2);
                await vote.voteForCandidate(1, 100, 350, {from: accounts[2]});
            }catch(error) {
                await vote.changeVoteType(1);
                assert.equal(error.message.includes("You don't have so many votes"), true);
            }
        });
    });

    describe('change candidate vote', async () => {
        it('change exsiting voting under straight type', async () => {
            let type = await vote.voteType();
            assert.equal(type.toNumber(), 1);

            await vote.createNewCandidate('Michael Jordan', 'https://MJ.jpg', 'NBA Basketball player', 150, {from: accounts[0]});
            let result4 = await vote.changeMyVote(2, 10, 1, 350, {from: accounts[1]});
            let event4 = result4.logs[0].args; 
            let voter = await vote.voters(accounts[1]);
            let candidate1 = await vote.candidates(1);
            let candidate2 = await vote.candidates(2);

            assert.equal(event4.candidateId.toNumber(), 2);
            assert.equal(event4.voteNum.toNumber(), 50);
            assert.equal(candidate1.candidateTotalVote.toNumber(), 100);
            assert.equal(candidate2.candidateTotalVote.toNumber(), 50);
            assert.equal(voter.voteChangeNum.toNumber(), 1);
        });

        it('change exsiting voting under cumulative type', async () => {
            await vote.changeVoteType(2);
            let type = await vote.voteType();
            assert.equal(type.toNumber(), 2);

            let result5 = await vote.changeMyVote(2, 50, 1, 350, {from: accounts[2]});
            let event5 = result5.logs[0].args; 
            let voter = await vote.voters(accounts[2]);
            let candidate1 = await vote.candidates(1);
            let candidate2 = await vote.candidates(2);

            assert.equal(event5.candidateId.toNumber(), 2);
            assert.equal(event5.voteNum.toNumber(), 50);
            assert.equal(candidate1.candidateTotalVote.toNumber(), 50);
            assert.equal(candidate2.candidateTotalVote.toNumber(), 100);
            assert.equal(voter.voteChangeNum.toNumber(), 1);

            await vote.changeVoteType(1);
            type = await vote.voteType();
            assert.equal(type.toNumber(), 1);
        });

        it('invalid change exsiting voting', async () => {
            //invalid vote date
            try{
                await vote.changeMyVote(2, 10, 1, 450, {from: accounts[1]});
            }catch(error){
                assert.equal(error.message.includes("The stage for voting is not valid, no vote can be created"), true);
            }
            //invalid candidate Id
            try{
                await vote.changeMyVote(3, 10, 1, 350, {from: accounts[1]});
            }catch(error){
                assert.equal(error.message.includes("Invalid Candidate Id"), true);
            }
            //have not voted for this candidate yet
            try{
                await vote.createNewCandidate('Ming Yao', 'https://MY.jpg', 'NBA & CBA Basketball player', 150, {from: accounts[0]});
                await vote.changeMyVote(3, 10, 1, 350, {from: accounts[1]});
            }catch(error){
                assert.equal(error.message.includes("voting info ID is wrong, you haven't voted for this person"), true);
            }
            //have not voted for this candidate yet
            try{
                await vote.changeVoteType(2);
                await vote.changeMyVote(2, 200, 1, 350, {from: accounts[2]});
            }catch(error){
                await vote.changeVoteType(1);
                assert.equal(error.message.includes("You don't have so many votes"), true);
            }
        });
    });

});