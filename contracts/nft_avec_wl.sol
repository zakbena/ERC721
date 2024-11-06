// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error nft_avec_wl_transfertFailed();

contract nft_avec_wl is ERC721, Ownable {
    uint256 private immutable i_price;
    uint256 private immutable i_maxSupply;
    uint256 private immutable i_whitelistSupply;
    uint256 private immutable i_whitelistPrice;
    uint256 private s_counter;
    uint256 private s_wcounter;
    string public baseUri;

    mapping(address => bool) private s_whitelist;

    constructor(
        uint256 price,
        uint256 whitelistPrice,
        string memory __BaseUri,
        uint256 maxsupply,
        uint256 whitelistSupply
    ) ERC721("Sample", "SMP") {
        i_price = price;
        baseUri = __BaseUri;
        i_maxSupply = maxsupply;
        i_whitelistSupply = whitelistSupply;
        i_whitelistPrice = whitelistPrice;
    }

    modifier onlyWhitelist() {
        if (!s_whitelist[msg.sender]) {
            revert nft_avec_wl_transfertFailed();
        }
        _;
    }

    function addToWhitelist(
        address[] calldata wl_Addresss,
        bool wl_bool
    ) external onlyOwner {
        for (uint256 i = 0; i < wl_Addresss.length; ) {
            s_whitelist[wl_Addresss[i]] = wl_bool;
            unchecked {
                ++i;
            }
        }
    }

    function removeFromWhitelist(
        address[] calldata wl_Addresss
    ) external onlyOwner {
        for (uint256 i = 0; i < wl_Addresss.length; ) {
            delete s_whitelist[wl_Addresss[i]];
            unchecked {
                ++i;
            }
        }
    }

    function whitelistMint() public payable onlyWhitelist {
        uint256 m_counter = s_wcounter;
        if (m_counter > i_whitelistSupply) {
            revert nft_avec_wl_transfertFailed();
        }
        if (msg.value != i_whitelistPrice) {
            revert nft_avec_wl_transfertFailed();
        }
        _mint(msg.sender, m_counter);
        s_whitelist[msg.sender] = false;
        s_wcounter += 1;
    }

    function mint(uint256 _quantity) public payable {
        uint256 m_counter = s_counter + i_whitelistSupply;
        if (_quantity > 10) {
            revert nft_avec_wl_transfertFailed();
        }

        if (m_counter + _quantity > i_maxSupply) {
            revert nft_avec_wl_transfertFailed();
        }

        if (msg.value != _quantity * i_price) {
            revert nft_avec_wl_transfertFailed();
        }

        for (uint8 i = 0; i < _quantity; ) {
            _mint(msg.sender, m_counter + i);
            unchecked {
                ++i;
            }
        }
        s_counter += _quantity;
    }

    function withdraw() public payable onlyOwner {
        uint256 amount = address(this).balance;
        (bool sucess, ) = msg.sender.call{value: amount}("");
        if (!sucess) {
            revert nft_avec_wl_transfertFailed();
        }
    }

    function isWhitelisted(address _user) public view returns (bool) {
        return s_whitelist[_user];
    }

    function getURI() public view returns (string memory) {
        return baseUri;
    }

    function getPrice() public view returns (uint256) {
        return i_price;
    }

    function getWlPrice() public view returns (uint256) {
        return i_whitelistPrice;
    }

    function getSupply() public view returns (uint256) {
        return (i_maxSupply);
    }

    function getWlSupply() public view returns (uint256) {
        return i_whitelistSupply;
    }

    function getCounter() public view returns (uint256) {
        return s_counter;
    }

    function getWlCounter() public view returns (uint256) {
        return s_wcounter;
    }

    function getSupplyMinted() public view returns (uint256) {
        return (s_counter + s_wcounter);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }
}
