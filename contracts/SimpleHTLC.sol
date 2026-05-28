// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleHTLC {
    bytes32 public hashlock;
    uint public timelock;
    address public sender;
    address public receiver;
    bool public isLocked;
    uint public amount;

    event Locked(bytes32 hashlock, address sender, address receiver, uint amount);

    constructor(bytes32 _hashlock, uint _timelock) {
        hashlock = _hashlock;
        timelock = _timelock;
        sender = msg.sender;
    }

    function lock(bytes32 _hashlock, address _receiver, uint _amount) public {
        require(!isLocked, "Already locked");
        hashlock = _hashlock;
        receiver = _receiver;
        amount = _amount;
        isLocked = true;
        emit Locked(hashlock, sender, receiver, amount);
    }
}
