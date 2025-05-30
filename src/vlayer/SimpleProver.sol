// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import {IERC721} from "openzeppelin-contracts/token/ERC721/IERC721.sol";

contract SimpleProver is Prover {
    IERC721 public immutable AGE_NFT;

    constructor(IERC721 _ageNft) {
        AGE_NFT = _ageNft;
    }

    function balance(address _owner) public returns (Proof memory, address, uint256) {
        uint256 nftBalance = AGE_NFT.balanceOf(_owner);

        return (proof(), _owner, nftBalance);
    }
}
