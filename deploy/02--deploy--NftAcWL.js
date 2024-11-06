const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const price = ethers.utils.parseEther("0.002");
  const wlPrice = ethers.utils.parseEther("0.001");
  const baseUri = "ipfs://[URI]/";
  const supply = "50";
  const wlSupply = "10";

  log("----------------------------------------------------");
  const arguments = [price, wlPrice, baseUri, supply, wlSupply];
  const nft_no_wl = await deploy("nft_avec_wl", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(nft_no_wl.address, arguments);
  }
};

module.exports.tags = ["all", "wl", "main"];
