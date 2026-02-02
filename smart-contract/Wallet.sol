// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Wallet {

    // Address that deploys the contract (acts like admin / NGO authority)
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // User structure
    struct User {
        bool exists;
        bool isVerified;
        uint256 reputation;
    }

    // Mapping wallet address → User
    mapping(address => User) public users;

    // Modifier: only owner can verify users
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Modifier: user must exist
    modifier userExists(address _user) {
        require(users[_user].exists, "User does not exist");
        _;
    }

    // 1️⃣ Create a wallet (financial identity)
    function createUser() public {
        require(!users[msg.sender].exists, "User already exists");

        users[msg.sender] = User({
            exists: true,
            isVerified: false,
            reputation: 0
        });
    }

    // 2️⃣ Verify a user (community / NGO action)
    function verifyUser(address _user)
        public
        onlyOwner
        userExists(_user)
    {
        users[_user].isVerified = true;
    }

    // 3️⃣ Increase reputation (after good transactions)
    function increaseReputation(address _user)
        public
        onlyOwner
        userExists(_user)
    {
        require(users[_user].isVerified, "User not verified");
        users[_user].reputation += 1;
    }

    // 4️⃣ View user reputation
    function getReputation(address _user)
        public
        view
        userExists(_user)
        returns (uint256)
    {
        return users[_user].reputation;
    }

    // 5️⃣ Check verification status
    function isUserVerified(address _user)
        public
        view
        userExists(_user)
        returns (bool)
    {
        return users[_user].isVerified;
    }
}
