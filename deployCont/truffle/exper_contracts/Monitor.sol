pragma solidity >=0.4.17 <0.6.0;
import './lib_sig_verify.sol';
import './lib_string-util.sol';
import './MonTool.sol';

contract Monitor {
    address[] internal bc_account = [address(0xb51FA99C248D426ff86fd60aE71834F662311913), address(0x204ae41b745CeE8301fcaEC7Add626718735CCd2), address(0xBC6596a9A1584e21d94DC65F606078dE8857db20)];
    address[] internal valsign_addr = [address(0xaB0e7Fb70Df014cF5520287EE1497817243B01A9), address(0x30776DC632f936C99eE1becB977C1733c7924a6F), address(0xbA092eb468BdB5a91147Cd924211883f10Be251B)];
    mapping(address => address) map_addr;
    uint256 current_stat = 0;
    uint256 cnt_dnode = 0;
    address internal executor = address(0x0);
    struct NodeStatus{
        string ans_fac;
        mapping(address => bool) matches;
    }
    mapping(uint256=>NodeStatus) internal node_status;
    mapping(address => bool) internal val_address;
    
    
    constructor() public {
        for (uint i=0; i<bc_account.length; i++){
            // val_address[bc_account[i]] = true;
            map_addr[bc_account[i]]=valsign_addr[i];
        }
    }
    
    modifier valExecutor() {
        require(executor == msg.sender, "Sender not authorized.");
        _;
    }

    function setExecutor() public view returns(bool){
        if (executor == address(0x0)){
            executor = msg.sender;
            return true;}
        else
            return false;  
    }  
    
    function setFAC(string message, uint8 v, bytes32 r, bytes32 s) public valExecutor returns(string memory, string memory){
        if (cnt_dnode ==0){
            if (sig_verification.verifymsg(map_addr[msg.sender],message,v, r, s)){
               var (timestamp, fac) = MonTool.spilt_parts(message);
            }
            /*
            node_status[timestamp].ans_fac = fac;
            node_status[timestamp].matches[msg.sender] = true;
            executor = address(0x0);
            current_stat = timestamp;
            cnt_dnode++;
            */
            //return true;
        }
        else 
            return ("a","b");
            //return false;
    }

}