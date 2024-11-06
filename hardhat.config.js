require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
const GOERLI_URL = process.env.RPC_URL;
const PRIVATE_KEY1 = process.env.PRIVATE_KEY;
const ETHERSCAN_API = process.env.ETHERSCAN_API_KEY;
const CMC_API = process.env.CMC;
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: `${process.env.RPC_URL}`,
      accounts: [`${PRIVATE_KEY1}`],
      chainId: 5,
      BlockConfirmations: 18,
    },
    local: {
      url: "http://127.0.0.1:8545/",
      accounts: [`${PRIVATE_KEY1}`],
      chainId: 31337,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: `${ETHERSCAN_API}`,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: CMC_API,
    // Token permit to specify the chain, default is eth
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0,
      // 5: 0,
    },
    player: {
      default: 1,
      // 5: 0,
    },
  },
  mocha: {
    timeout: 20000,
  },
};
