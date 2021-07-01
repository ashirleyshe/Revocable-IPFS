pragma solidity >=0.4.17 <0.6.0;
import './strings.sol';

library monTool {
    using strings for *;

    function spilt_parts(string memory message) internal pure returns(uint, string memory){
        strings.slice memory s = message.toSlice();
        strings.slice memory delim = ":".toSlice();
        string[] memory parts = new string[](s.count(delim));
        for (uint i = 0; i < parts.length; i++) {
           parts[i] = s.split(delim).toString();
        }
        return (stringToUint(parts[0]),parts[1]);
    }
    
    function stringToUint(string s) internal pure returns (uint) {
        bytes memory b = bytes(s);
        uint result = 0;
        for (uint i = 0; i < b.length; i++) { 
            if (b[i] >= 48 && b[i] <= 57) {
                result = result * 10 + (uint(b[i]) - 48); 
            }
        }
        return result;
    }
    
}
