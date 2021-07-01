pragma solidity ^0.4.16;

contract FAC_Comparison {
    
    address[] qulified_account =  [0xB8a008AA6AFe8AB5687EE5280d806433e35f5CB9];
    address[] unqulified_account =  [0xB2Bf81cd0397A604BdE415473Fb49854B82CBE8e, 0x115011EFcBC5912Dc4Da7a058209bD93BDE801C7];
    /*
    struct Remove_file_auth{
        bytes32 ipfs_filehash;
        mapping(address => bool) public matches;
    }
     
    Remove_file_auth[] public rmfile_auth;
    */
    
    struct FAC_Sync{
        uint256 timestamp; // timestamp on block
        bytes32 ipfs_filehash;
        mapping(address => bool) matches[];
    }
     
    FAC_Sync[] public fac_sync;
    
    
    constructor(bytes32 current_FAC) public {
        fac_sync.push(FAC_Sync(
            {
                timestamp: Time_call(),
                ipfs_filehash: current_FAC,
                matches
                
            }))
        
         questions.push(Question({
        name: _name,
        answers: answersLocal
    }));
        
    }
    
    
    function Time_call() returns (uint256){
        return now;
    }
    
    /*qulified_account update FAC*/
    function set_FAC(address updater, bytes32 new_FAC) public returns (int) {
        bool checkList = false;
        for(uint q = 0; q < qulified_account.length;q++){
            if(updater == qulified_account[q]){
                checkList = true;
                FAC = new_FAC;
                return 1;
            }
        }
        
        if(checkList==false){
            for(uint un = 0; un < unqulified_account.length;un++){
                if(updater == unqulified_account[un]){
                    checkList = true;
                    return 0;
                }
            }
            if(checkList==false)
                return -1;
        }
    } 
    
    
    function get_FAC() public constant returns (bytes32){
        return FAC;
    }
    
    
    
    
    
}