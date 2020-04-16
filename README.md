# EECE571G_BLOCKCHAIN_Final_Project

## Basic Info
  Project Name: Global Voting System
  
  Group Name: TBD.
  
  This is the repository for UBC EECE571G Blockchain Software Engineering Project, 2020.
  
  Steps:
  1. cd client : npm install
  2. New workspace in Ganache with truffle-config.js under root
  3. truffle compile
  4. truffle migrate --reset
  5. type "npm start" under ./client
  6. Copy first account key from Ganache and import into metamask with new created account
  7. Refresh the page
## Features
   This Dapp is for straight voting and cumulative voting on the blockchain.
   
   What is the difference between straight voting and cumulative voting? -> see here[https://tremblylaw.com/cumulative-and-straight-voting-know-the-difference/]
   
   Key functions:
   
   1. Candidate Creation ** Can only be done by deployer **
   2. Share Allocation  ** Can only be done by deployer **
   3. Vote setting & vote start end date  ** Can only be done by deployer **
   4. Vote type change  ** Can only be done by deployer **
   5. Vote for multiple candidate (But you can't exceed the number of open seats, and can't exceed your shares)
   6. View personal vote history
   7. Change personal vote (maximum 3 times)
   8. Change the your vote (You have 3 chances to change your vote)
   9. View real-time voting results

## Framework
### Back-end
solidity + truffle + Ganache

### Front-end
react + web3 + bootstrap



