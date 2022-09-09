const Ideas = artifacts.require("Ideas");

module.exports = function (deployer) {
  deployer.deploy(Ideas);
};