const Finisher = artifacts.require("Finisher");

module.exports = function(deployer) {
  deployer.deploy(Finisher);
};