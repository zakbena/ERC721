const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe.only("nft_avec_wl", function () {
      // Initializing variable that will be retreived from the contract
      let nft_contract,
        deployer,
        counter,
        c_price,
        c_supply,
        c_uri,
        c_wprice,
        c_wsupply;
      let chainId = network.config.chainId;

      // Constructors variable sent
      const price = ethers.utils.parseEther("0.002");
      const wlPrice = ethers.utils.parseEther("0.001");
      const baseUri = "ipfs://[URI]/";
      const supply = "50";
      const wlSupply = "10";
      const publicSupply = supply - wlSupply;

      // Retreiving variables after deploying
      beforeEach(async function () {
        deployer = (await getNamedAccounts).deployer;
        await deployments.fixture(["wl"]);
        nft_contract = await ethers.getContract("nft_avec_wl", deployer);
        counter = await nft_contract.getCounter();
        c_price = await nft_contract.getPrice();
        c_wprice = await nft_contract.getWlPrice();
        c_supply = await nft_contract.getSupply();
        c_wsupply = await nft_contract.getWlSupply();
        c_uri = await nft_contract.getURI();
      });

      describe("constructor", function () {
        it("Initalize all variable", async function () {
          assert.equal(c_price.toString(), price.toString());
          assert.equal(c_wprice.toString(), wlPrice.toString());
          assert.equal(c_supply, supply);
          assert.equal(c_wsupply, wlSupply);
          assert.equal(c_uri, baseUri);
        });
      });

      describe("addToWhitelist", function () {
        it("Add a set of whitelists to our contract", async function () {
          const accounts = await ethers.getSigners();
          // Looping through accounts to make an array of addresses
          const accountArray = [];
          for (let i = 0; i < 5; i++) {
            accountArray.push(accounts[i].address);
          }

          // Adding addresses to the whitelist
          const addingWhitelist = await nft_contract.addToWhitelist(
            accountArray,
            true
          );
          const responce = await addingWhitelist.wait(1);
          // Verifying the first and last address using the contract native function
          const verify0 = await nft_contract.isWhitelisted(accountArray[0]);
          const verify4 = await nft_contract.isWhitelisted(accountArray[4]);
          assert.equal(true, verify0);
          assert.equal(true, verify4);
        });

        it("Doesn't allow other than Owner to add to whitelist", async function () {
          const accounts = await ethers.getSigners();
          // Connecting account[1]
          const connected_contract = await nft_contract.connect(accounts[1]);
          // Adding with accounts[1]
          const addingWhitelist = await expect(
            connected_contract.addToWhitelist([accounts[1].address], true)
          ).to.be.reverted;
        });
      });

      describe("removeFromWhitelist", function () {
        it("Reset the passed address from the Whitelist Array", async function () {
          const accounts = await ethers.getSigners();
          // Adding to whitelist
          const addingWhitelist = await nft_contract.addToWhitelist(
            [accounts[1].address],
            true
          );
          // Removing from whitelist
          const removeWhitelist = await nft_contract.removeFromWhitelist([
            accounts[1].address,
          ]);
          // Contract removeFromWhitelist() function set the state of the mapping at 0
          const verify = await nft_contract.isWhitelisted(accounts[1].address);
          assert.equal(verify, 0);
        });

        it("Doesn't allow other than Owner to remove from whitelist", async function () {
          const accounts = await ethers.getSigners();
          // Connecting account[1], remindig deployer is [0]
          const connected_contract = await nft_contract.connect(accounts[1]);
          // Using addToWhitelist() with deployer
          const addingWhitelist = await nft_contract.addToWhitelist(
            [accounts[1].address],
            true
          );
          // Using removeFromWhitelist() with account[1]
          const removeWhitelist = await expect(
            connected_contract.removeFromWhitelist([accounts[1].address])
          ).to.be.reverted;
        });
      });

      describe("whitelistMint", function () {
        it("Allow whitelisted to buy", async function () {
          const accounts = await ethers.getSigners();
          const whitelistAddress = accounts[1].address;
          // Adding accounts[1] to whitelist
          const addingWhitelist = await nft_contract.addToWhitelist(
            [whitelistAddress],
            true
          );
          // Connecting accounts[1] and minting
          const connected_contract = await nft_contract.connect(accounts[1]);
          const whitelistMintTx = await connected_contract.whitelistMint({
            value: wlPrice,
          });

          // Checking balance, OpenZepplein 721 implentation native function
          const balanceOfConnectedAccount = await connected_contract.balanceOf(
            whitelistAddress
          );
          expect(whitelistMintTx);

          assert.equal(balanceOfConnectedAccount.toString(), "1");
        });

        it("Doesn't Allow non-whitelisted to buy", async function () {
          const accounts = await ethers.getSigners();
          const connected_contract = await nft_contract.connect(accounts[2]);
          const whitelistMintTx = await expect(
            connected_contract.whitelistMint({
              value: wlPrice,
            })
          ).to.be.reverted;
        });

        it("Increment the whitelist counter", async function () {
          const accounts = await ethers.getSigners();
          const whitelistAddress = accounts[1].address;
          const addingWhitelist = await nft_contract.addToWhitelist(
            [whitelistAddress],
            true
          );

          const connected_contract = await nft_contract.connect(accounts[1]);
          const whitelistMintTx = await connected_contract.whitelistMint({
            value: wlPrice,
          });

          const getCounter = await nft_contract.getWlCounter();

          assert.equal(getCounter, "1");
        });

        it("Can't mint over the max whitelist supply", async function () {
          const accounts = await ethers.getSigners();
          const accountArray = [];
          for (let i = 0; i <= 11; i++) {
            accountArray.push(accounts[i].address);
          }
          const addingWhitelist = await nft_contract.addToWhitelist(
            accountArray,
            true
          );

          for (let i = 0; i <= 10; i++) {
            const connected_contract = await nft_contract.connect(accounts[i]);
            const whitelistMintTx = await connected_contract.whitelistMint({
              value: wlPrice,
            });
          }

          //   Un-comment to test the whitelist counter
          //   for (i = 0; i <= 10; ++i) {
          //     const ownerOfToken = await nft_contract.tokenURI(i);
          //     console.log(ownerOfToken);
          //   }
          //   const remainingSupply = await nft_contract.getSupplyMinted();
          //   console.log(remainingSupply.toString());

          const getWlCounter = await nft_contract.getWlCounter();

          assert.equal(getWlCounter.toString(), "11");

          const connected_contract_last_account = await nft_contract.connect(
            accounts[11]
          );

          const verify = await nft_contract.isWhitelisted(accountArray[11]);
          assert.equal(true, verify);

          const whitelistMintTx2 = await expect(
            connected_contract_last_account.whitelistMint({
              value: wlPrice,
            })
          ).to.be.reverted;

          const getWlCounter2 = await nft_contract.getWlCounter();
          assert.equal(getWlCounter2.toString(), "11");
        });

        it("Doesn't allow a whitelisted to mint twice", async function () {
          const accounts = await ethers.getSigners();
          const whitelistAddress = accounts[1].address;
          const addingWhitelist = await nft_contract.addToWhitelist(
            [whitelistAddress],
            true
          );

          const connected_contract = await nft_contract.connect(accounts[1]);
          const whitelistMintTx = await connected_contract.whitelistMint({
            value: wlPrice,
          });

          const verify = await nft_contract.isWhitelisted(whitelistAddress);
          assert.equal(false, verify);

          const whitelistMintTx2 = await expect(
            connected_contract.whitelistMint({
              value: wlPrice,
            })
          ).to.be.reverted;
        });

        it("Doesn't allow a whitelisted to mint if not enough ether", async function () {
          const accounts = await ethers.getSigners();
          const whitelistAddress = accounts[1].address;
          const addingWhitelist = await nft_contract.addToWhitelist(
            [whitelistAddress],
            true
          );

          const verify = await nft_contract.isWhitelisted(whitelistAddress);
          assert.equal(true, verify);

          const connected_contract = await nft_contract.connect(accounts[1]);
          const whitelistMintTx2 = await expect(
            connected_contract.whitelistMint({
              value: ethers.utils.parseEther("0.000000000001"),
            })
          ).to.be.reverted;
        });
      });

      describe("mint", function () {
        it("Allow a mint", async function () {
          const accounts = await ethers.getSigners();
          const deployer_address = accounts[0].address;
          const mint = await nft_contract.mint(1, { value: price });
          const balanceMinter = await nft_contract.balanceOf(deployer_address);
          assert.equal(balanceMinter.toString(), "1");
        });

        it("Increase the counter and start at the whitelist supply count", async function () {
          const accounts = await ethers.getSigners();
          const mint = await nft_contract.mint(1, { value: price });
          const getCounter = await nft_contract.getCounter();
          assert.equal(getCounter.toString(), 1);
          const ownerOfToken = await nft_contract.tokenURI(wlSupply);
          assert.equal(`${baseUri}${wlSupply}`, ownerOfToken);
        });

        it("Can't mint if not enough/too much ether sent", async function () {
          const accounts = await ethers.getSigners();
          const mint = await expect(
            nft_contract.mint(1, {
              value: ethers.utils.parseEther("0.0001"),
            })
          ).to.be.reverted;

          const mint2 = await expect(
            nft_contract.mint(1, {
              value: ethers.utils.parseEther("0.02"),
            })
          ).to.be.reverted;
        });

        it("Doesn't Allow more than 10 mint per tx", async function () {
          const mint = await nft_contract.mint(10, {
            value: price.mul(10),
          });
          const mint2 = await expect(
            nft_contract.mint(15, {
              value: price.mul(15),
            })
          );
        });

        it("Doeesn't allow the mint if the supply has been reached", async function () {
          for (i = 1; i <= publicSupply / 10; ++i) {
            const mint = await nft_contract.mint(10, {
              value: price.mul(10),
            });
          }

          const getCounter = await nft_contract.getCounter();
          assert.equal(getCounter.toString(), publicSupply);

          const mint = await expect(
            nft_contract.mint(1, {
              value: price,
            })
          ).to.be.reverted;
        });
      });

      describe("Token Uri Stress Test", function () {
        // Here trying to stress test the URI
        //  Reminding: token0 is minting by the null address
        // Two counters: 1 for the whitelisted, one for the public
        // Public counter start at + Whitelisted_Supply (i.e if public_counter = 0 and whitelist supply 10, start at 10 )
        // Whitelisted counter start at 0, tokenId0 is automaticely transfered to null address

        it("Permit to mint all token with every URI", async function () {
          const accounts = await ethers.getSigners();
          const accountArray = [];

          for (i = 1; i <= publicSupply / 10; ++i) {
            const mint = await nft_contract.mint(10, {
              value: price.mul(10),
            });
            const waiting = mint.wait(1);
          }

          for (i = wlSupply; i <= publicSupply / 10; ++i) {
            const ownerOfToken = await nft_contract.tokenURI(i);

            assert.equal(ownerOfToken, `${baseUri}${i}`);
          }

          for (let i = 0; i <= 9; i++) {
            accountArray.push(accounts[i].address);
          }

          const addingWhitelist = await nft_contract.addToWhitelist(
            accountArray,
            true
          );

          for (let i = 0; i <= 9; i++) {
            const connected_contract = await nft_contract.connect(accounts[i]);
            const whitelistMintTx = await connected_contract.whitelistMint({
              value: wlPrice,
            });
            const waiting = whitelistMintTx.wait(1);
            const ownerOfToken = await nft_contract.tokenURI(i);

            assert.equal(ownerOfToken, `${baseUri}${i}`);
          }

          const remainingSupply = await nft_contract.getSupplyMinted();

          assert.equal(remainingSupply.toString(), supply);
        });

        it("Permit to mint all public token with every URI", async function () {
          const accounts = await ethers.getSigners();
          const accountArray = [];

          for (i = 1; i <= publicSupply / 10; ++i) {
            const mint = await nft_contract.mint(10, {
              value: price.mul(10),
            });
            const waiting = mint.wait(1);
          }

          for (i = wlSupply; i <= publicSupply / 10; ++i) {
            const ownerOfToken = await nft_contract.tokenURI(i);
            assert.equal(ownerOfToken, `${baseUri}${i}`);
          }
        });

        it("Permit to mint all whitelist token with every URI", async function () {
          const accounts = await ethers.getSigners();
          const accountArray = [];
          for (let i = 0; i <= 9; i++) {
            accountArray.push(accounts[i].address);
          }
          const addingWhitelist = await nft_contract.addToWhitelist(
            accountArray,
            true
          );

          for (let i = 0; i <= 9; i++) {
            const connected_contract = await nft_contract.connect(accounts[i]);
            const whitelistMintTx = await connected_contract.whitelistMint({
              value: wlPrice,
            });
            const waiting = whitelistMintTx.wait(1);
            const ownerOfToken = await nft_contract.tokenURI(i);
            assert.equal(ownerOfToken, `${baseUri}${i}`);
          }
        });
      });

      describe("withdraw", function () {
        it("Retrieve the fund", async function () {
          const accounts = await ethers.getSigners();
          // Mint tx
          const quantity = 5;
          const tx = await nft_contract.mint(quantity, {
            value: price.mul(quantity),
          });

          // Pre mint deployer and contract balance
          const startingNftWlBalance = await nft_contract.provider.getBalance(
            nft_contract.address
          );
          const preBalance = await nft_contract.provider.getBalance(
            accounts[0].address
          );

          //  tx
          const retrieve = await nft_contract.withdraw();
          const responce = await retrieve.wait(1);
          // Gas cost
          const { gasUsed, effectiveGasPrice } = responce;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          //   console.log("Gas Used:", gasCost);
          // Ending Balance
          const balanceAfter = await nft_contract.provider.getBalance(
            accounts[0].address
          );
          const EndingNftWlBalance = await nft_contract.provider.getBalance(
            nft_contract.address
          );

          assert.equal(EndingNftWlBalance, 0);
          assert.equal(
            startingNftWlBalance.add(preBalance).toString(),
            balanceAfter.add(gasCost).toString()
          );
        });

        it("Doesn't allow others to withdraw funds", async function () {
          // Mint tx
          const quantity = 5;
          const tx = await nft_contract.mint(quantity, {
            value: price.mul(quantity),
          });
          // Connect account[1] to the contract
          const accounts = await ethers.getSigners();
          const nft_contract_connected = await nft_contract.connect(
            accounts[1]
          );
          const tx_connected = await expect(nft_contract_connected.withdraw())
            .to.be.reverted;
        });
      });
    });
