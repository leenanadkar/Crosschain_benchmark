// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RoleOrchestrated {
    mapping(address => bytes32) public roles;

    event RoleGranted(address indexed account, bytes32 role);

    function grantRole(bytes32 role, address account) public {
        roles[account] = role;
        emit RoleGranted(account, role);
    }

    function hasRole(bytes32 role, address account) public view returns (bool) {
        return roles[account] == role;
    }
}
