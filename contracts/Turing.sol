// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Turing is ERC20, Ownable {
    mapping(string => address) public authorizedUsers;
    mapping(address => mapping(string => bool)) public hasVoted;
    bool public votingActive = true;
    address public professor = 0x502542668aF09fa7aea52174b9965A7799343Df7;

    modifier onlyAuthorized() {
        require(msg.sender == owner() || msg.sender == professor, "Not authorized");
        _;
    }

    modifier votingIsActive() {
        require(votingActive, "Voting is not active");
        _;
    }

    constructor() ERC20("Turing", "TUR") {}

    function issueToken(string memory codename, uint256 amount) external onlyAuthorized {
        address recipient = authorizedUsers[codename];
        require(recipient != address(0), "Invalid codename");
        _mint(recipient, amount);
    }

    function vote(string memory codename, uint256 amount) external votingIsActive {
        require(amount <= 2 * 10**18, "Max vote amount is 2 TUR");
        address voter = msg.sender;
        require(authorizedUsers[codename] != voter, "Cannot vote for yourself");
        require(!hasVoted[voter][codename], "Already voted for this user");
        
        address recipient = authorizedUsers[codename];
        require(recipient != address(0), "Invalid codename");
        
        _mint(recipient, amount);
        _mint(voter, 0.2 * 10**18);
        hasVoted[voter][codename] = true;
    }

    function votingOn() external onlyAuthorized {
        votingActive = true;
    }

    function votingOff() external onlyAuthorized {
        votingActive = false;
    }

    function registerUser(string memory codename, address user) external onlyOwner {
        authorizedUsers[codename] = user;
    }
}
