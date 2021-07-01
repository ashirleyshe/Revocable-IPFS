pragma solidity >=0.4.17 <0.6.0;
import "./sig_verification.sol";
import "./monTool.sol";
import "./IPFSlog.sol";

contract FACSync {
    // 15sec
    IPFSlog public ipfslog = IPFSlog(
        0x2b9141088eefa99d34730c19ae8a10e4df5e139d
    );
    address[] internal bc_account = [
        address(0xb51FA99C248D426ff86fd60aE71834F662311913),
        address(0x204ae41b745CeE8301fcaEC7Add626718735CCd2),
        address(0xBC6596a9A1584e21d94DC65F606078dE8857db20)
    ];
    // 5sec
    // IPFSlog public ipfslog = IPFSlog(0x71d9fc92db3938d1dcd543e2ab03ff1a8d36efde);
    // address[] internal bc_account = [address(0x03e1Ba68651c7C953ab0874D5f488F2734347906), address(0xC4d181E0A3784E4F39E2F428aC164f01a1b85183), address(0xe7b4EE0A3131A84832a297B41Ee15FdC38E0ce94)];
    address[] internal valsign_addr = [
        address(0xaB0e7Fb70Df014cF5520287EE1497817243B01A9),
        address(0x30776DC632f936C99eE1becB977C1733c7924a6F),
        address(0xbA092eb468BdB5a91147Cd924211883f10Be251B)
    ];
    mapping(address => address) map_addr;
    address internal executor = address(0x0);
    address public cur_exe = address(0x0);
    uint256 public cur_ts = 0;

    struct NodeStatus {
        string ans_fac;
        mapping(address => int256) matches;
    }
    mapping(uint256 => NodeStatus) public node_status;
    mapping(address => bool) public val_address;
    event Info(
        uint256 t,
        string f,
        uint256 cursta,
        string facin,
        bool correct,
        string msg
    );
    event File(uint256 int_cnt, uint256 api_cnt, bool s);
    event Log_file(
        address sender,
        string function_name,
        bool succeed_or_not,
        string memo
    );

    function clear_all() {
        executor = address(0x0);
        cur_ts = 0;

    }
    function get_nodestatus(uint256 ts)
        view
        returns (
            uint256 timestamp,
            string ans_fac,
            address updater,
            int256 iscorrect
        )
    {
        return (
            ts,
            node_status[ts].ans_fac,
            msg.sender,
            node_status[ts].matches[msg.sender]
        );

    }
    modifier valExecutor() {
        require(executor == msg.sender, "Executor not authorized.");
        _;
    }
    constructor() public {
        for (uint256 i = 0; i < bc_account.length; i++) {
            map_addr[bc_account[i]] = valsign_addr[i];
            val_address[bc_account[i]] = true;
        }
    }

    function check_all_update() view returns (bool ans) {
        if (cur_ts == 0) {
            return true;
        } else {
            for (uint256 i = 0; i < bc_account.length; i++) {
                if (val_address[bc_account[i]] == true) {
                    if (node_status[cur_ts].matches[bc_account[i]] == 0)
                        return false;
                }

            }
            return true;
        }
    }

    function getFlag() public {
        if (val_address[msg.sender] == true) {
            //get setFAC permission (executor)
            if (check_all_update()) {
                if (keccak256(executor) == keccak256(address(0x0))) {
                    executor = msg.sender;
                    emit Log_file(msg.sender, "getFlag", true, "NEW_SET");
                } else {
                    if (keccak256(executor) == keccak256(msg.sender))
                        emit Log_file(
                            msg.sender,
                            "getFlag",
                            true,
                            "SET_ALREADY"
                        );
                    else
                        emit Log_file(msg.sender, "getFlag", false, "OCCUPIED");
                }
            } else
                emit Log_file(msg.sender, "getFlag", false, "UPR_HAVENT_SYNC");

        } else emit Log_file(msg.sender, "getFlag", false, "INVALID_SENDER");
    }

    function getStat()
        public
        view
        returns (
            address exe,
            uint256 curts_index,
            address current_exe,
            int256 status
        )
    {
        return (
            executor,
            cur_ts,
            cur_exe,
            node_status[cur_ts].matches[cur_exe]
        );
    }

    function setFAC(
        string memory message,
        uint8 v,
        bytes32 r,
        bytes32 s,
        string memory cnt,
        uint8 f_v,
        bytes32 f_r,
        bytes32 f_s
    ) public valExecutor returns (bool) {
        if (
            sig_verification.verifymsg(map_addr[msg.sender], cnt, f_v, f_r, f_s)
        ) {
            uint256 int_cnt = strings.stringToUint(cnt);
            if (int_cnt == ipfslog.get_api_cnt()) {
                if (
                    sig_verification.verifymsg(
                        map_addr[msg.sender],
                        message,
                        v,
                        r,
                        s
                    )
                ) {
                    uint256 timestamp;
                    string memory fac;
                    (timestamp, fac) = monTool.spilt_parts(message);
                    if (cur_ts <= timestamp) {
                        cur_exe = msg.sender; //unused
                        cur_ts = timestamp;
                        node_status[timestamp].ans_fac = fac;
                        node_status[timestamp].matches[msg.sender] = 1;
                        executor = address(0x0);

                        emit Log_file(
                            msg.sender,
                            "setFAC",
                            true,
                            "SET_SUCCEED"
                        );
                    } else {
                        executor = address(0x0);
                        emit Log_file(
                            msg.sender,
                            "setFAC",
                            false,
                            "TIMECHECK_FAILED"
                        );
                    }
                } else emit Log_file(msg.sender, "setFAC", false, "SIG_FALIED");
            } else {
                emit Log_file(
                    msg.sender,
                    "setFAC_filematch",
                    false,
                    "FCNT_NOTMATCH"
                );
                emit File(int_cnt, ipfslog.get_api_cnt(), false);
            }
        } else
            emit Log_file(
                msg.sender,
                "setFAC_filecnt",
                false,
                "file_SIG_FALIED"
            );
    }

    function updateFAC(
        string memory message,
        uint8 v,
        bytes32 r,
        bytes32 s,
        string memory cnt,
        uint8 f_v,
        bytes32 f_r,
        bytes32 f_s
    ) public returns (bool) {
        if (val_address[msg.sender] == true) {
            if (!check_all_update()) {
                if (
                    sig_verification.verifymsg(
                        map_addr[msg.sender],
                        cnt,
                        f_v,
                        f_r,
                        f_s
                    )
                ) {
                    uint256 int_cnt = strings.stringToUint(cnt);
                    if (int_cnt == ipfslog.get_api_cnt()) {
                        if (
                            sig_verification.verifymsg(
                                map_addr[msg.sender],
                                message,
                                v,
                                r,
                                s
                            )
                        ) {
                            uint256 timestamp;
                            string memory fac;
                            (timestamp, fac) = monTool.spilt_parts(message);
                            if (
                                timestamp >= cur_ts &&
                                node_status[cur_ts].matches[msg.sender] == 0
                            ) {
                                if (
                                    keccak256(
                                        abi.encodePacked(
                                            (node_status[cur_ts].ans_fac)
                                        )
                                    ) ==
                                    keccak256(abi.encodePacked((fac)))
                                ) {
                                    node_status[cur_ts].matches[msg.sender] = 1;
                                    emit Log_file(
                                        msg.sender,
                                        "renew_status",
                                        true,
                                        "SET_SUCCEED"
                                    );

                                } else {
                                    node_status[cur_ts].matches[msg
                                        .sender] = -1;
                                    val_address[msg.sender] = false;
                                    emit Log_file(
                                        msg.sender,
                                        "renew_status",
                                        false,
                                        "PASS_SIG-SYNC_FAILED"
                                    );
                                }
                            } else
                                emit Log_file(
                                    msg.sender,
                                    "renew_status",
                                    false,
                                    "TIME_MISMATCH-OR-LOG_EXSIST"
                                );
                        } else
                            emit Log_file(
                                msg.sender,
                                "renew_status",
                                false,
                                "SIG_FALIED"
                            );
                    } else
                        emit Log_file(
                            msg.sender,
                            "renew_status_filematch",
                            false,
                            "FCNT_NOTMATCH"
                        );
                } else
                    emit Log_file(
                        msg.sender,
                        "renew_status_filematch",
                        false,
                        "FCNT_SIG_FALIED"
                    );
            } else
                emit Log_file(msg.sender, "renew_status", false, "ALL_UPDATED");
        } else
            emit Log_file(msg.sender, "renew_status", false, "INVALID_SENDER");
    }

}
