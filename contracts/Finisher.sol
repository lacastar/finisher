//SPDX-License-Identifier: MIT
pragma solidity >= 0.5.0 < 0.7.0;
pragma experimental ABIEncoderV2;

// import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.4/ChainlinkClient.sol";
// import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.4/vendor/Ownable.sol";
// import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract Finisher{ // is Initializable {
  struct MedalOwned { // structure to store medal relation to wallet with metadata
    // uint medalid; // medal position in medalhashes and id off chain
    // string resultid; // result id off chain
    string result; // result value
    bool isSet; // helper to check empty struct
    // bytes32 checkhash; // result hash
  }

  struct Medal {
    bytes32 checkhash; // keccak256 hash of the medal data stored offchain
    // string offchainid; // offchain id of medal
    // uint count; // how many medals are available
    uint distributed; // number of distributed medals
    address owner; // owner address
  }

  // event emitted on medal creation
  event MedalCreated(string offchainid, address owner);

  //event emitted on medal verification
  event MedalVerified(address owner, string offchainid, string result);

  mapping(string => Medal) medals; // registered medals mapped to offchainid
  address payable owner; // contract owner address
  uint256 medalcost; // medal cost

  mapping(address => mapping(string => MedalOwned)) finishers; // mapping the medals to user address

  // function initialize(uint _medalcost) public initializer {
  //  medalcost = _medalcost;
  // }
  constructor() public {
    owner = msg.sender;
    medalcost = 2 finney;
  }

  function setMedalCost(uint256 _medalcost) public{
    require(msg.sender == owner, "Not authorized");
    medalcost = _medalcost;
  }

  function getMedalCost() public view returns(uint256){
    return medalcost;
  }

  function createMedal(string memory _offchainid, bytes32 _checkhash) public{
    // medals.push(Medal(_checkhash,_offchainid, 0, msg.sender));
    medals[_offchainid] = Medal(_checkhash, 0, msg.sender);
    emit MedalCreated(_offchainid, msg.sender); // medals.length-1);
  }

  function getMedal(string memory _offchainid) public view returns(Medal memory){
    // require(_medalid < medals.length, "Invalid index specified");
    return medals[_offchainid];
  }

  function getResultForMedal(string memory _offchainid) public view returns(MedalOwned memory){
    return finishers[msg.sender][_offchainid];
  }

  function claimMedal(string memory _offchainid, string memory _endpoint) public payable{
    //todo check price
    require(!finishers[msg.sender][_offchainid].isSet, "Medal already claimed!");
    finishers[msg.sender][_offchainid] = MedalOwned("result", true);
    emit MedalVerified(msg.sender, _offchainid, _endpoint);
  }

}
