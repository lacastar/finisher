//SPDX-License-Identifier: MIT
pragma solidity >= 0.5.0 < 0.8.0;
pragma experimental ABIEncoderV2;

contract Finisher {
  struct MedalOwned { // structure to store medal relation to wallet with metadata
    // uint medalid; // medal position in medalhashes and id off chain
    // string resultid; // result id off chain
    bytes32 result; // result value
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

  // struct OracleRequest {
  //  address sender; // the message sender
  //  string offchainId;// offchainId
  // }

  // event emitted on medal creation
  event MedalCreated(string offchainid, address owner);

  //event emitted on medal verification
  event MedalVerified(address owner, string offchainid, bytes32 result);

  mapping(string => Medal) medals; // registered medals mapped to offchainid
  address payable private owner; // contract owner address
  uint256 private medalcost; // medal cost
  // bytes32 private jobId = "576a17f61fd9498198f7754d2b1b3f58"; // chainlink job id
  // address private oracle = 0x4a3FBbB385b5eFEB4BC84a25AaADcD644Bd09721; // chainlink oracle contract address
  // uint256 private oraclecost = 1; // oracle calling cost (in LINK)

  mapping(address => mapping(string => MedalOwned)) finishers; // mapping the medals to user address

  // mapping(bytes32 => OracleRequest) requestmap; // chainlink request id mapped to requests

  /*constructor(address _link) public {
    // Set the address for the LINK token for the network.
    if(_link == address(0)) {
      // Useful for deploying to public networks.
      setPublicChainlinkToken();
    } else {
      // Useful if you're deploying to a local network.
      setChainlinkToken(_link);
    }
    owner = msg.sender;
    medalcost = 2 finney;
  }*/
  constructor() public {
  //    setPublicChainlinkToken();
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

  // function setJobId(bytes32 _jobId) public{
  //  require(msg.sender == owner, "Not authorized");
  //  jobId = _jobId;
  // }

  // function getJobId() public view returns(bytes32){
  //  require(msg.sender == owner, "Not authorized");
  //  return jobId;
  // }

  // function setOracle(address _oracle) public{
  //  require(msg.sender == owner, "Not authorized");
  //  oracle = _oracle;
  // }

  // function getOracle() public view returns(address){
  //  require(msg.sender == owner, "Not authorized");
  //  return oracle;
  // }

  // function setOraclecost(uint256 _oraclecost) public{
  //  require(msg.sender == owner, "Not authorized");
  //  oraclecost = _oraclecost;
  // }

  // function getOraclecost() public view returns(uint256){
  //  require(msg.sender == owner, "Not authorized");
  //  return oraclecost;
  // }

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

  // function fulfillClaim(bytes32 _requestId, bytes32 _result) public
  //  recordChainlinkFulfillment(_requestId){
  //  OracleRequest memory req = requestmap[_requestId];
  //  if(_result[0] != 0){
  //    finishers[req.sender][req.offchainId] = MedalOwned(_result, true);
  //  }
  //  emit MedalVerified(req.sender, req.offchainId, _result);
  //  delete requestmap[_requestId];
  // }

  // function claimMedal(string memory _offchainid, string memory _endpoint) public payable{
  //  require(!finishers[msg.sender][_offchainid].isSet, "Medal already claimed!");
  //  require(msg.value == medalcost, "Insufficent fund sent!");
  //  Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfillClaim.selector);
  //  req.add("get", _endpoint);
  //  req.add("path", "result");
  //  bytes32 requestId = sendChainlinkRequestTo(oracle, req, oraclecost * LINK);
  //  requestmap[requestId] = OracleRequest(msg.sender, _offchainid);
  // }

  function claimMedal(string memory _offchainid, bytes32 _result, uint8 v, bytes32 r, bytes32 s) public payable{
   require(!finishers[msg.sender][_offchainid].isSet, "Medal already claimed!");
   require(msg.value == medalcost, "Insufficent fund sent!");
   bytes32 h = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(_offchainid, msg.sender, _result))));
   require(owner == ecrecover(h, v, r, s), "Invalid signature!");

    if(_result[0] != 0){
      finishers[msg.sender][_offchainid] = MedalOwned(_result, true);
      emit MedalVerified(msg.sender, _offchainid, _result);
    }
  }

  // withdrawLink allows the owner to withdraw any extra LINK on the contract
  // function withdrawLink()
  //  public
  // {
  //  require(msg.sender == owner, "Not authorized");
  //  LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
  //  require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
  // }
  function withdrawEth(uint256 withdraw) public {
    require(msg.sender == owner, "Not authorized");
    owner.transfer(withdraw);
  }

  function getBalance() public view returns (uint256) {
    require(msg.sender == owner, "Not authorized");
    return address(this).balance;
  }

  function transferOwnership(address payable newOwner) public {
    require(msg.sender == owner, "Not authorized");
    owner = newOwner;
  }

}
