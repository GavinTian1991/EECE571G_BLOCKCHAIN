var Vote = artifacts.require("Vote");

module.exports = function(deployer) {
  deployer.deploy(Vote,5,100,50,1,{gas: 6000000});
};
// constructor param:

// add candidate start date
// add candidate end date
// vote start date
// vote end date
// max nominate seats
// total shares
// max shares of a person
// vote type