const monTool = artifacts.require("monTool");
const sig_verification = artifacts.require("sig_verification");
const strings = artifacts.require("strings");
const FACSync = artifacts.require("FACSync");
const IPFSlog = artifacts.require("IPFSlog");

module.exports = function(deployer) {
  deployer.deploy(sig_verification);
  deployer.deploy(monTool);
  deployer.deploy(strings);
  deployer.deploy(FACSync);
  deployer.deploy(IPFSlog);
};
