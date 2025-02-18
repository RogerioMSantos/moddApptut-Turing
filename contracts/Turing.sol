// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Turing is ERC20, Ownable {
    
    mapping(string => address) public nameToAddress;
    mapping(address => string) public addressToName;
    mapping(address => uint) public addresToAmount;
    mapping(address => mapping(string => bool)) public hasVoted;

    bool public votingActive = true;
    address public professora = 0x502542668aF09fa7aea52174b9965A7799343Df7;
    string[] public userCodenames;

    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || msg.sender == professora,
            "Not authorized"
        );
        _;
    }

    modifier votingIsActive() {
        require(votingActive, "Voting is not active");
        _;
    }

    modifier onlyMembers() {
        require(bytes(addressToName[msg.sender]).length > 0, "Not a member");
        _;
    }

    modifier voteYourself(string memory codename) {
        require(nameToAddress[codename] != msg.sender, "Cannot vote for yourself");
        _;
    }

    modifier alreadyVoted(string memory codename) {
        require(!hasVoted[msg.sender][codename], "Already voted for this user");
        _;
    }

    modifier maxVoteAmmout(uint256 amount) {
        require(amount <= 2 * 10 ** 18, "Max vote amount is 2 TUR");
        _;
    }

    function addUser(string memory codename, address user) internal {
        nameToAddress[codename] = user;
        addressToName[user] = codename;
        userCodenames.push(codename);
    }

    constructor() ERC20("Turing", "TUR") {
        addUser("nome1", 0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
        addUser("nome2", 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC);
        addUser("nome3", 0x90F79bf6EB2c4f870365E785982E1f101E93b906);
        addUser("nome4", 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65);
        addUser("nome5", 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc);
        addUser("nome6", 0x976EA74026E726554dB657fA54763abd0C3a0aa9);
        addUser("nome7", 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955);
        addUser("nome8", 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f);
        addUser("nome9", 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720);
        addUser("nome10", 0xBcd4042DE499D14e55001CcbB24a551F3b954096);
        addUser("nome11", 0x71bE63f3384f5fb98995898A86B02Fb2426c5788);
        addUser("nome12", 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a);
        addUser("nome13", 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec);
        addUser("nome14", 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097);
        addUser("nome15", 0xcd3B766CCDd6AE721141F452C550Ca635964ce71);
        addUser("nome16", 0x2546BcD3c84621e976D8185a91A922aE77ECEc30);
        addUser("nome17", 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E);
        addUser("nome18", 0xdD2FD4581271e230360230F9337D5c0430Bf44C0);
        addUser("nome19", 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199);
    }

    event Deposit(
        string name,
        uint value
    );
    
    function _mint(address account,uint amount) internal override{
        super._mint(account, amount);
        addresToAmount[account] += amount;
        emit Deposit(addressToName[account], amount);
    }	

    function issueToken(
        string memory codename,
        uint256 amount
    ) external onlyAuthorized
     {
        address recipient = nameToAddress[codename];
        require(recipient != address(0), "Invalid codename");
        _mint(recipient, amount);
    }

    function vote(
        string memory codename,
        uint256 amount
    )
        external
        votingIsActive
        onlyMembers
        voteYourself(codename)
        alreadyVoted(codename)
        maxVoteAmmout(amount)
    {
        address voter = msg.sender;

        _mint(nameToAddress[codename], amount);
        _mint(voter, 0.2 * 10 ** 18);

        hasVoted[voter][codename] = true;
    }

    function votingOn() external onlyAuthorized {
        votingActive = true;
    }

    function votingOff() external onlyAuthorized {
        votingActive = false;
    }

    function getRanking() external view returns (string[] memory names, uint256[] memory amount) {
        uint256[] memory amounts = new uint256[](userCodenames.length);
        for (uint256 i = 0; i < userCodenames.length; i++) {
            amounts[i] = balanceOf(nameToAddress[userCodenames[i]]);
        }
        
        return (userCodenames,amounts);
    }
}
