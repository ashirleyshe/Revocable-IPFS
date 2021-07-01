const TruffleContract = require("truffle-contract");
const Web3 = require('web3');
const ethereumUri = 'http://localhost:8545';
const fs = require('fs');
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(ethereumUri));

var TestDelete;
var deploy_info;

const deploy = async () => {
    return new Promise(function(resolve,reject){
       TestDelete.new(deploy_info, function (err, instance) {
            if (!err) {
                
                if (!instance.address) {
                
                    console.log(`myContract.transactionHash = ${instance.transactionHash}`); 
                } else {
                
                    console.log(`myContract.address = ${instance.address}`); // the contract address
                    global.contractAddress = instance.address;
                    resolve(instance);
                }
            } else {
                
                console.log(err);
            }
        });
    });
};

(async () => {
    if(!web3.isConnected()){
        throw new Error('unable to connect to ethereum node at ' + ethereumUri);
    }else{
        console.log('connected to ehterum node at ' + ethereumUri);
        let coinbase = web3.eth.coinbase;
        console.log('coinbase:' + coinbase);
        let balance = web3.eth.getBalance(coinbase);
        console.log('balance:' + web3.fromWei(balance, 'ether') + " ETH");
        let accounts = web3.eth.accounts;
        web3.eth.defaultAccount = web3.eth.accounts[0];
        console.log(accounts);
    
        var contract = JSON.parse(fs.readFileSync("./truffle/build/contracts/FACSync.json",'utf8'));
        var abi = contract.abi;
        var bytecode = contract.bytecode;
    
        let gasEstimate = 8000000; //web3.eth.estimateGas({data: bytecode});    
        TestDelete = web3.eth.contract(abi);
        
        // console.log('deploying contract...');
        deploy_info = {from:web3.eth.coinbase, data: bytecode, gas: gasEstimate}
   
        t = await deploy(); // deploy_contracts();
        console.log(t);
        // console.log('deploying contract success!');
    }
})();