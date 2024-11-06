const { network, ethers } = require("hardhat");

const networkConfig = {
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    vrfV2coordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    entrancefee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "11880",
    callBackGasLimit: "5000000",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    entrancefee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callBackGasLimit: "5000000",
    interval: "30",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = "8";
const INITIAL_ANSWER = "20000000000";

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER };
