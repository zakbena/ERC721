const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft_sans_wl", function () {
      let BasicNFT_contract, deployer, counter, c_price, c_supply, c_uri;
      let chainId = network.config.chainId;

      const price = ethers.utils.parseEther("0.001");
      const baseUri = "ipfs://[URI]/";
      const supply = "50";

      beforeEach(async function () {
        deployer = (await getNamedAccounts).deployer;
        await deployments.fixture(["no_wl"]);
        nft_no_wl = await ethers.getContract("Nft_sans_wl", deployer);
        counter = await nft_no_wl.getCounter();
        c_price = await nft_no_wl.getPrice();
        c_supply = await nft_no_wl.getSupply();
        c_uri = await nft_no_wl.getURI();
      });

      describe("constructor", function () {
        it("Initialize the constructor", async function () {
          const name = await nft_no_wl.name();
          const symbol = await nft_no_wl.symbol();
          assert.equal(c_price.toString(), price);
          assert.equal(c_uri.toString(), baseUri);
          assert.equal(c_supply.toString(), supply);
          assert.equal(name.toString(), "Sample");
          assert.equal(symbol.toString(), "SMP");
        });
      });

      describe("mint", function () {
        it("Update the counter when a NFT is minted", async function () {
          const tx = await nft_no_wl.mint(1, { value: price });
          counter = await nft_no_wl.getCounter();
          assert.equal(counter.toString(), "1");
        });

        it("Update the counter when multiple NFT is minted", async function () {
          const quantity = 5;
          const tx = await nft_no_wl.mint(quantity, {
            value: price.mul(quantity),
          });
          counter = await nft_no_wl.getCounter();
          assert.equal(counter.toString(), "5");
        });

        it("Revert if the supply has exceded", async function () {
          const quantity = 10;

          for (let i = 0; i < 5; ++i) {
            const tx = await nft_no_wl.mint(quantity, {
              value: price.mul(quantity),
            });
          }

          counter = await nft_no_wl.getCounter();
          console.log("NFT mint:", counter.toString());
          const tx2 = await expect(nft_no_wl.mint(1, { value: price })).to.be
            .reverted;
        });

        it("Revert if not enough/to much Ether has been sent", async function () {
          const tx = await expect(
            nft_no_wl.mint(1, { value: ethers.utils.parseEther("0.00001") })
          ).to.be.reverted;
          const tx2 = await expect(
            nft_no_wl.mint(1, { value: price.mul("50") })
          ).to.be.reverted;
        });

        it("Revert if too much NFT are minted in one transaction", async function () {
          const quantity = 11;
          const tx = await expect(
            nft_no_wl.mint(quantity, {
              value: price.mul(quantity),
            })
          ).to.be.reverted;
        });
      });

      describe("withdraw", function () {
        it("Retrieve the fund", async function () {
          const accounts = await ethers.getSigners();
          // Mint tx
          const quantity = 5;
          const tx = await nft_no_wl.mint(quantity, {
            value: price.mul(quantity),
          });

          // Pre mint deployer and contract balance
          const startingNftWlBalance = await nft_no_wl.provider.getBalance(
            nft_no_wl.address
          );
          const preBalance = await nft_no_wl.provider.getBalance(
            accounts[0].address
          );

          //  tx
          const retrieve = await nft_no_wl.withdraw();
          const responce = await retrieve.wait(1);
          // Gas cost
          const { gasUsed, effectiveGasPrice } = responce;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          console.log("Gas Used:", gasCost);
          // Ending Balance
          const balanceAfter = await nft_no_wl.provider.getBalance(
            accounts[0].address
          );
          const EndingNftWlBalance = await nft_no_wl.provider.getBalance(
            nft_no_wl.address
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
          const tx = await nft_no_wl.mint(quantity, {
            value: price.mul(quantity),
          });
          // Connect account[1] to the contract
          const accounts = await ethers.getSigners();
          const nft_no_wl_connected = await nft_no_wl.connect(accounts[1]);
          const tx_connected = await expect(nft_no_wl_connected.withdraw()).to
            .be.reverted;
        });
      });

      describe("tokenURI", function () {
        it("Return the good tokenURI for one NFT minted", async function () {
          const tx = await nft_no_wl.mint(1, {
            value: price,
          });
          const tokenUri_1 = await nft_no_wl.tokenURI(0);

          assert.equal(tokenUri_1.toString(), `${baseUri}0`);
        });

        it("Return the good tokenURI for multiple NFT minted", async function () {
          const tx = await nft_no_wl.mint(5, {
            value: price.mul(5),
          });
          const tokenUri_1 = await nft_no_wl.tokenURI(0);
          const tokenUri_2 = await nft_no_wl.tokenURI(1);
          const tokenUri_3 = await nft_no_wl.tokenURI(2);
          const tokenUri_4 = await nft_no_wl.tokenURI(3);
          const tokenUri_5 = await nft_no_wl.tokenURI(4);

          assert.equal(tokenUri_1.toString(), `${baseUri}0`);
          assert.equal(tokenUri_2.toString(), `${baseUri}1`);
          assert.equal(tokenUri_3.toString(), `${baseUri}2`);
          assert.equal(tokenUri_4.toString(), `${baseUri}3`);
          assert.equal(tokenUri_5.toString(), `${baseUri}4`);
        });
      });
    });
