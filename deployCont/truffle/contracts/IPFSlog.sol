pragma solidity >=0.4.17 <0.6.0;
import "./strings.sol";

contract IPFSlog {
    using strings for *;
    uint256 internal cur_index = 0;
    event Cmdlog(address sender, uint256 index, string cmd, string filename);
    event API_fileAmt(address sender, uint256 api_amt, bool succeed_or_not);
    struct Input_str {
        string cur_cmd;
        string left_cmd;
        string cur_filename;
        string left_filename;
    }
    uint256 api_cnt = 0;
    mapping(uint256 => Input_str) log_cmd;

    function set_api_cnt(uint256 input) external {
        api_cnt = input;
    }

    function get_api_cnt() external view returns (uint256 apicnt) {
        return api_cnt;
    }
    function keeplog(
        address sender,
        uint256 api_amt,
        uint256 file_amt,
        string memory cmd,
        string memory filename
    ) public {
        string memory tmp_cmd = cmd;
        string memory tmp_filename = filename;
        bool tmp = false;
        while (file_amt != 0) {
            tmp = true;
            file_amt -= 1;
            (
                log_cmd[cur_index].cur_cmd,
                log_cmd[cur_index].left_cmd,
                log_cmd[cur_index].cur_filename,
                log_cmd[cur_index].left_filename
            ) = spilt_parts(tmp_cmd, tmp_filename);
            tmp_cmd = log_cmd[cur_index].left_cmd;
            tmp_filename = log_cmd[cur_index].left_filename;
            emit Cmdlog(
                sender,
                cur_index,
                log_cmd[cur_index].cur_cmd,
                log_cmd[cur_index].cur_filename
            );
            cur_index += 1;
        }
        api_cnt = api_amt;
        emit API_fileAmt(sender, api_amt, tmp);
    }

    function spilt_parts(string memory cmd, string memory fn)
        internal
        pure
        returns (string memory, string memory, string memory, string memory)
    {
        strings.slice memory cmds = cmd.toSlice();
        strings.slice memory fns = fn.toSlice();
        strings.slice memory delim = ":".toSlice();
        string[] memory cmdp = new string[](2);
        string[] memory fnp = new string[](2);
        cmdp[0] = cmds.split(delim).toString();
        cmdp[1] = cmds.toString();
        fnp[0] = fns.split(delim).toString();
        fnp[1] = fns.toString();
        return (cmdp[0], cmdp[1], fnp[0], fnp[1]);
    }
}
