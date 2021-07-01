pragma solidity >=0.4.17 <0.6.0;
import './lib_sig_verify.sol';
import './MonTool.sol';

contract TestDelete {
    address[] internal bc_account = [address(0xb51FA99C248D426ff86fd60aE71834F662311913), address(0x204ae41b745CeE8301fcaEC7Add626718735CCd2), address(0xBC6596a9A1584e21d94DC65F606078dE8857db20)];
    address[] internal valsign_addr = [address(0xaB0e7Fb70Df014cF5520287EE1497817243B01A9), address(0x30776DC632f936C99eE1becB977C1733c7924a6F), address(0xbA092eb468BdB5a91147Cd924211883f10Be251B)];
    mapping(address => address) map_addr;
    address internal executor = address(0x0);
    uint[] cur_ts = [0,0];
    uint cnt_dnode = 0;
    struct NodeStatus{
        string ans_fac;
        mapping(address => bool) matches;
    }
    mapping(uint=>NodeStatus) internal node_status;
    mapping(address => bool) internal val_address;
     event Info (uint t, string f,uint cursta,string facin,bool correct, string msg);
     
    modifier valExecutor() {
        require(executor == msg.sender, "Sender not authorized.");
        _;
    }
    constructor() public {
        for (uint i=0; i<bc_account.length; i++){
            map_addr[bc_account[i]]=valsign_addr[i];
            val_address[bc_account[i]] = true;
        }
    }
    function getFlag() public returns(bool){
        if (executor == address(0x0)){
            executor = msg.sender;
            return true;}
        else return false;  
    }
    function setFAC(string memory message, uint8 v, bytes32 r, bytes32 s) public valExecutor returns(bool) {
        if(sig_verification.verifymsg(map_addr[msg.sender],message,v, r, s)){
            uint timestamp;
            string memory fac;
            (timestamp, fac) = MonTool.spilt_parts(message);
            node_status[timestamp].ans_fac = fac;
            node_status[timestamp].matches[msg.sender] = true;
            cur_ts[1] = cur_ts[0];
            cur_ts[0] = timestamp;
            executor = address(0x0);
            emit Info(timestamp, fac,cur_ts[0],node_status[timestamp].ans_fac,node_status[timestamp].matches[msg.sender],"pass verifymsg");
            return true;        
        }
        emit Info(0, "",cur_ts[0],"",false,"failed verifymsg");
        return false;
    }
    function getStat() public view returns (address,uint){
        return (executor,cur_ts[0]);
    }
    //to be test
    function renew_status(string memory message, uint8 v, bytes32 r, bytes32 s) public valExecutor returns(bool){
        if(sig_verification.verifymsg(map_addr[msg.sender],message,v, r, s)){
            uint timestamp;
            string memory fac;
            (timestamp, fac) = MonTool.spilt_parts(message);
            if (timestamp>=cur_ts[0]&&timestamp<cur_ts[1]){
                if (keccak256(abi.encodePacked((node_status[cur_ts[0]].ans_fac))) == keccak256(abi.encodePacked((fac)))) 
                    node_status[cur_ts[0]].matches[msg.sender] = true;
                else 
                    node_status[cur_ts[0]].matches[msg.sender] = false;
                emit Info(timestamp, fac,cur_ts[0],node_status[timestamp].ans_fac,node_status[timestamp].matches[msg.sender],"pass verifymsg");
            }
        }
         emit Info(0, "",cur_ts[0],"",false,"failed verifymsg");
    }
}