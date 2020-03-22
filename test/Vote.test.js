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
    })

});