// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PixelPunks is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _rareTokenIds = 0;
    uint256 private _commonTokenIds = 500;
    string private _baseTokenURI;
    mapping (uint256 => bool) private _mintedTokens;

    constructor(string memory baseTokenURI) ERC721("Pixel Punks", "PPNK") {
        _baseTokenURI = baseTokenURI;
    }

    function mintRare(address to) public onlyOwner returns (uint256) {
        require(_rareTokenIds < 500, "All rare tokens have been minted");

        _rareTokenIds += 1;
        _mint(to, _rareTokenIds);
        _mintedTokens[_rareTokenIds] = true;
        return _rareTokenIds;
    }

    function mintCommon(address to) public onlyOwner returns (uint256) {
        require(_commonTokenIds < 1000, "All common tokens have been minted");

        _commonTokenIds += 1;
        _mint(to, _commonTokenIds);
        _mintedTokens[_commonTokenIds] = true;
        return _commonTokenIds;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId <= 500 ? "rare/" : "common/", tokenId.toString())) : "";
    }
}
