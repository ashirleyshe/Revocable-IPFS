const HDWalletProvider = require("truffle-hdwallet-provider");
const TruffleContract = require("truffle-contract");
const MyContractJson = require("./build/contracts/TestDelete.json");

const MyContract = TruffleContract(MyContractJson);
const mnemonic = 'upper enhance addict video salmon action crew sea attitude glare settle carpet'
const url =  "http://localhost:8546"
const HDProvider = new HDWalletProvider(mnemonic, url);

MyContract.setProvider(HDProvider);
MyContract.defaults({ from: HDProvider.addresses[0] });
console.log(MyContract);

async function deployContract() {
    const instance = await MyContract.new();
    console.log("contract was deployed at:", instance.address)
    process.exit(0)
}

deployContract();