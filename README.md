
# NFT Smart Contracts - Learning Project

This repository contains a series of Solidity smart contracts and associated test scripts for an NFT (Non-Fungible Token) project, developed for educational purposes. The project explores the implementation of NFT contracts, including versions with and without a whitelist feature.

## Overview

This project includes two main NFT smart contracts:
1. **Nft_sans_wl**: A basic NFT contract without a whitelist.
2. **nft_avec_wl**: An NFT contract that includes a whitelist feature, allowing whitelisted addresses to mint at a reduced cost.

Each contract offers essential functionalities such as NFT minting, URI management, and fund withdrawal. The test scripts are built with Hardhat and include thorough unit tests to validate each contract's functionality and limits.

## Contracts

### Nft_sans_wl
- **Contract Address**: To be deployed on test networks.
- **Features**:
  - Basic minting function with a fixed price.
  - Total supply capped at 50 NFTs.
  - URI management for IPFS integration.
  - Fund withdrawal restricted to the contract owner.
  
### nft_avec_wl
- **Contract Address**: To be deployed on test networks.
- **Features**:
  - Whitelisted addresses can mint NFTs at a discounted price.
  - Whitelist management (adding and removing addresses) restricted to the owner.
  - Total supply capped at 50 NFTs, with a reserved whitelist supply of 10.
  - Minting restrictions ensure fair access for both public and whitelisted users.
  
## Deployment Scripts

The project includes two deployment scripts:
- **01--deploy--Nft_sans_wl.js**: Deploys the `Nft_sans_wl` contract with specified parameters.
- **02--deploy--NftAcWL.js**: Deploys the `nft_avec_wl` contract with additional whitelist parameters.

Each deployment script leverages Hardhat’s deployment and verification tools for seamless deployment on supported networks.

## Test Scripts

The project contains comprehensive test scripts for each contract, written in JavaScript using the Hardhat framework:
- **nft_no_wl_test.js**: Tests for the `Nft_sans_wl` contract, covering minting, supply limits, price validation, and fund withdrawal.
- **nft_wl_test.js**: Tests for the `nft_avec_wl` contract, including whitelist functionality, price validation for both public and whitelisted users, and minting constraints.

## Getting Started

1. **Prerequisites**:
   - Node.js
   - Hardhat
   - Chai for assertions

2. **Installation**:
   Clone this repository and install the dependencies:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   npm install
   ```

3. **Testing**:
   Run the tests to validate the functionality:
   ```bash
   npx hardhat test
   ```

4. **Deployment**:
   Use Hardhat to deploy the contracts to a test network:
   ```bash
   npx hardhat run scripts/01--deploy--Nft_sans_wl.js --network <network-name>
   ```
   or
    ```bash
   npx hardhat run scripts/02--deploy--NftAcWL.js --network <network-name>
   ```

## License

This project is for educational purposes and is licensed under the MIT License. Use at your own risk for development and testing purposes only.

## Acknowledgments

This project was created as a learning exercise to understand smart contract development, Solidity programming, and NFT standards on Ethereum. Special thanks to contributors and open-source libraries that made this project possible.
