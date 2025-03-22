const ProductRegistry = artifacts.require("ProductRegistry");

module.exports = function (deployer) {
  deployer.deploy(ProductRegistry, { gas: 5000000 }); // Increase gas to avoid failure
};
