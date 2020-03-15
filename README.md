# EECE571G_BLOCKCHAIN
  Project Name: Vote System
  Group Name: TBD.
  
  This is the repository for UBC EECE571G Blockchain Software Engineering Project, 2020.
  
  Steps:
  1. cd client : npm install
  2. New workspace in Ganache with truffle-config.js under root
  3. truffle test 
  4. truffle migrate --reset
  5. Comment line 54 - 61 in App.js // Because the dapp start with init candidates which needs an account with ETH value to        approve the transaction, we do not have add candidates function yet
  6. npm start under ./client
  7. Copy account key from Ganache and import into metamask with new created account
  8. Uncomment line 54 - 61 in App.js and restart dapp, confirm 4 transactions by order
  9. Refresh the page
