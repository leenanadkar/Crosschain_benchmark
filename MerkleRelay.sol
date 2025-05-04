// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MerkleRelay {
    bytes32 public merkleRoot;

    constructor(bytes32 _root) {
        merkleRoot = _root;
    }

    function verify(bytes32[] memory proof, bytes32 leaf, bytes32 root) public pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint i = 0; i < proof.length; i++) {
            computedHash = keccak256(abi.encodePacked(computedHash, proof[i]));
        }

        return computedHash == root;
    }

    // Wrapper to benchmark gas
    function verifyWithGas(bytes32[] memory proof, bytes32 leaf, bytes32 root) public returns (bool) {
        return verify(proof, leaf, root);
    }
}
