pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    address private owner;
    uint256 private claimStartBlock;

    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** 18);
        owner = msg.sender;
        claimStartBlock = 1343543;
    }

    function setClaimStartBlock(uint256 newBlockNumber) external onlyOwner {
        claimStartBlock = newBlockNumber;
    }

    function claim() external {
        require(
            block.number >= claimStartBlock,
            "Claim period has not started yet"
        );
        require(balanceOf(owner) >= 1000 * 10 ** 18, "Insufficient tokens");
        transfer(msg.sender, 1000 * 10 ** 18);
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }
}
