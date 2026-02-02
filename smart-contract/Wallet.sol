// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Wallet {

    struct User {
        bool isVerified;
        uint256 reputation;
    }

    mapping(address => User) public users;

}
