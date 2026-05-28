// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ThresholdHTLC {
    address[] public signers;
    uint public threshold;
    mapping(bytes32 => bool) public commitments;

    event Locked(bytes32 indexed commitment);

    constructor(address[] memory _signers, uint _threshold) {
        require(_threshold <= _signers.length, "Threshold exceeds signer count");
        signers = _signers;
        threshold = _threshold;
    }

    function lock(bytes32 commitment) public {
        require(!commitments[commitment], "Already committed");
        commitments[commitment] = true;
        emit Locked(commitment);
    }
}
