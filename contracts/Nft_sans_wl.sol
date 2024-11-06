// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error Nft_sans_wl_transfertFailed();

contract Nft_sans_wl is ERC721, Ownable {
    uint256 private immutable i_price;
    uint256 private immutable i_supply;
    uint256 private s_counter;
    string public baseUri;

    constructor(
        uint256 price,
        string memory __BaseUri,
        uint256 supply
    ) ERC721("Sample", "SMP") {
        i_price = price;
        baseUri = __BaseUri;
        i_supply = supply;
    }

    function mint(uint256 _quantity) external payable {
        uint256 m_counter = s_counter;
        if (m_counter + _quantity > i_supply) {
            revert Nft_sans_wl_transfertFailed();
        }
        if (msg.value != _quantity * i_price) {
            revert Nft_sans_wl_transfertFailed();
        }

        if (_quantity > 10) {
            revert Nft_sans_wl_transfertFailed();
        }

        for (m_counter; m_counter < _quantity; ) {
            _mint(msg.sender, m_counter);
            // _mint unwrapped

            unchecked {
                ++m_counter;
            }
        }
        s_counter += _quantity;
    }

    function withdraw() public payable onlyOwner {
        uint256 amount = address(this).balance;
        (bool sucess, ) = msg.sender.call{value: amount}("");
        if (!sucess) {
            revert Nft_sans_wl_transfertFailed();
        }
    }

    function getURI() public view returns (string memory) {
        return baseUri;
    }

    function getPrice() public view returns (uint256) {
        return i_price;
    }

    function getSupply() public view returns (uint256) {
        return i_supply;
    }

    function getCounter() public view returns (uint256) {
        return s_counter;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }
}
