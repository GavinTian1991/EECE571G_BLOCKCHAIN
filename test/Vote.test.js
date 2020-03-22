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

});