pragma solidity >=0.4.17 <0.6.0;

import './lib_sig_verify.sol';


contract Monitor {
    
    
    address[] bc_account = [address(0xb51FA99C248D426ff86fd60aE71834F662311913),
                            address(0x204ae41b745CeE8301fcaEC7Add626718735CCd2),
                            address(0xBC6596a9A1584e21d94DC65F606078dE8857db20)];
                            
    address[] valsign_addr = [address(0xaB0e7Fb70Df014cF5520287EE1497817243B01A9),
                            address(0x30776DC632f936C99eE1becB977C1733c7924a6F),
                            address(0xbA092eb468BdB5a91147Cd924211883f10Be251B)];
                            
   mapping(address => address) map_addr;
   
    address internal executor = address(0x0);
    uint256 current_stat = 0;
    uint256 public cnt_dnode = 0;
    event Unsync_Alert(
        uint256 time_index, 
        address current_caller,
        bool states,
        bool is_sync
    );
    
    struct NodeStatus{
        string ans_fac;
        mapping(address => bool) matches;
    }
    
    mapping(uint256=>NodeStatus) public node_status;
    mapping(address => bool) public val_address;
    
    constructor() public {
        uint i;
        for (i=0; i<bc_account.length; i++)
            val_address[bc_account[i]] = true;
            map_addr[bc_account[i]]=valsign_addr[i];
    }
    
    /* [Debug]
    event init (address tmp1, bool tmp2);
    event info(
        address ex,
        bytes32 tmp1,
        bytes32 tmp2,
        bool com
    );
    function getvalue(uint256 sol_timestamp, string memory o_fac) public {
        bytes32 tmp1 = keccak256(abi.encodePacked((node_status[sol_timestamp].ans_fac)));
        bytes32 tmp2 = keccak256(abi.encodePacked((o_fac)));
        bool com;
        if (keccak256(abi.encodePacked((node_status[sol_timestamp].ans_fac))) == keccak256(abi.encodePacked((o_fac))))
            com = true;
        else
            com = false;
        emit info(executor, tmp1, tmp2,com);
    }
    */
    
    
    function setExecutor() public returns(bool){
        if (executor == address(0x0)){
            executor = msg.sender;
            return true;
        }
        else
            return false;  
    }  

    modifier valExecutor() {
        require(executor == msg.sender, "Sender not authorized.");
        _;
    }
    
    // modifier create new list for other nodes to sync
    function setFAC(uint256 timestamp, string memory fac) public valExecutor returns(bool){
        if (cnt_dnode ==0){
            node_status[timestamp].ans_fac = fac;
            node_status[timestamp].matches[msg.sender] = true;
            // set flag to null
            executor = address(0x0);
            //notify others to perform deletion
            current_stat = timestamp;
            cnt_dnode++;
            return true;
        }
        else 
            return false;
    }
    
    // check to know if need to perform deletion
    function getStat() public view returns (uint256){
        return current_stat;
    }
    
    function renew_status(uint256 sol_timestamp, string memory o_fac) public valExecutor returns(bool){
        if (keccak256(abi.encodePacked((node_status[sol_timestamp].ans_fac))) == keccak256(abi.encodePacked((o_fac)))){
            node_status[sol_timestamp].matches[msg.sender] = true;
            emit Unsync_Alert(sol_timestamp, msg.sender, node_status[sol_timestamp].matches[msg.sender],true);
        }
        else {
            node_status[sol_timestamp].matches[msg.sender] = false;
            val_address[msg.sender] = false;
            emit Unsync_Alert(sol_timestamp, msg.sender,node_status[sol_timestamp].matches[msg.sender], false);
        }
        // set flag to null
        executor = address(0x0);
        //notify others to perform deletion
        
        // this need to more strict(if same node resubmmit stituation)
        cnt_dnode++;
        if (cnt_dnode==bc_account.length)
            cnt_dnode = 0;
        return node_status[sol_timestamp].matches[msg.sender];
    }
    
    
    function verify(string memory message, uint8 v, bytes32 r, bytes32 s) public returns (address signer){
        return sig_verification.verifymsg(message,v, r, s);
    }
    

    
    
}