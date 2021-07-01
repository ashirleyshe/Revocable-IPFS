"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var delete_File = '../log/deleteFile.txt';
var api_cmd_log = '../log/api_cmd_log.out';
var local_ls_log = '../log/local_pinls.out';
var FSjson = '../../src/contracts/FACSync.json';
var ipfscmdtmp = '../log/ipfsCmdTmp.json';
// const uploadFolder = './large_file/';
var fs = require("fs");
// const json_info = './json_info.json';
var axios = require('axios');
var ethers = require("ethers");
/*ipfs*/
var ipfsClient = require("ipfs-http-client");
var ipfs = ipfsClient('http://localhost:5001');
/* For smart contract use */
var Web3 = require('web3');
//remember change to current geth node [ip:port]
var ethereumUri = 'http://140.113.216.99:8545';
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(ethereumUri));
/* contract info */
var FScontract = JSON.parse(fs.readFileSync(FSjson, 'utf8'));
var FSabi = FScontract.abi;
// 15 
var FSaddr = '0x8904ce9c435543faba4474e03d40f368af4fef38'; //master flag 
// 5
// const FSaddr = '0xe9911422941c4474c49f963e0dd9aad63f288c03'; //master flag
var FSinstance = new web3.eth.Contract(FSabi, FSaddr);
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function async_get_local_pinls() {
    return __awaiter(this, void 0, void 0, function () {
        var local_pinls, logger, _i, local_pinls_1, value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ipfs.pin.ls()];
                case 1:
                    local_pinls = _a.sent();
                    logger = fs.createWriteStream(local_ls_log, { flags: 'w' });
                    for (_i = 0, local_pinls_1 = local_pinls; _i < local_pinls_1.length; _i++) {
                        value = local_pinls_1[_i];
                        logger.write(value.hash + '\n');
                    }
                    logger.end();
                    return [2 /*return*/];
            }
        });
    });
}
var cmd_logs;
function async_get_api_cmd_log() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios.get('http://140.113.216.99:3000/ipfs/event/trigger/sc/IL/getALog')
                        .then(function (res) {
                        var count = Object.keys(res.data).length;
                        var logger = fs.createWriteStream(api_cmd_log, { flags: 'w' });
                        for (var i = 0; i < count; i++) {
                            //console.log(res.data[count-1].returnValues);
                            logger.write(res.data[i].returnValues.cmd + ',' + res.data[i].returnValues.filename + '\n');
                        }
                        logger.end();
                    })["catch"](function (error) {
                        console.error(error);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var unpin_list;
function async_get_unpin_list() {
    return __awaiter(this, void 0, void 0, function () {
        var com_result, exec, procChild, _a, _b, e_1;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    com_result = false;
                    exec = require('child_process').exec;
                    procChild = new Promise(function (resolve, reject) {
                        var yourscript = exec('python comp.py', function (error, stdout, stderr) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                // console.log('------running comp.py-----');
                                if (error !== null) {
                                    console.log("exec error: " + error);
                                    reject(error);
                                }
                                console.log("" + stdout);
                                resolve("" + stdout);
                                return [2 /*return*/];
                            });
                        }); });
                    });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, procChild];
                case 2:
                    unpin_list = _b.apply(_a, [_c.sent()]);
                    // console.log(unpin_list);
                    com_result = true;
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _c.sent();
                    com_result = false;
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, com_result];
            }
        });
    });
}
function set_FAC(msg, sigm, cnt, sigf) {
    return __awaiter(this, void 0, void 0, function () {
        var setFstate, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, FSinstance.methods.setFAC(msg, sigm.v, sigm.r, sigm.s, cnt, sigf.v, sigf.r, sigf.s).send({ from: web3.eth.defaultAccount })];
                case 1:
                    setFstate = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    return [2 /*return*/, setFstate];
                case 3: return [2 /*return*/, setFstate];
            }
        });
    });
}
function get_state() {
    return __awaiter(this, void 0, void 0, function () {
        var state, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, FSinstance.methods.getStat().call()];
                case 1:
                    // console.log("start func get_state ...");
                    state = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_3 = _a.sent();
                    console.log("get_state: %o", e_3);
                    return [2 /*return*/, e_3];
                case 3: return [2 /*return*/, state];
            }
        });
    });
}
function get_flag() {
    return __awaiter(this, void 0, void 0, function () {
        var flag;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, FSinstance.methods.getFlag().send({ from: web3.eth.defaultAccount })];
                case 1:
                    flag = _a.sent();
                    if (flag.events.Log_file.returnValues.succeed_or_not === false) {
                        console.log("failed to set flag in function");
                        return [2 /*return*/, flag.events.Log_file.returnValues];
                    }
                    else {
                        return [2 /*return*/, flag.events.Log_file.returnValues.succeed_or_not];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var flag;
function async_getflag() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_flag()];
                case 1:
                    flag = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var state;
function async_getstate() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_state()];
                case 1:
                    state = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var set_done;
function async_setFAC(msg, sigm, cnt, sigf) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, set_FAC(msg, sigm, cnt, sigf)];
                case 1:
                    set_done = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function async_self_healing() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, async_get_api_cmd_log()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, async_get_local_pinls()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, async_get_unpin_list()];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function jsonConcat(o1, o2) {
    for (var key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}
/*exp*/
function check_node_update() {
    return __awaiter(this, void 0, void 0, function () {
        var state_1, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, FSinstance.methods.check_all_update().call()];
                case 1:
                    state_1 = _a.sent();
                    return [2 /*return*/, state_1];
                case 2:
                    e_4 = _a.sent();
                    // console.log("check_node_update: %o", e);
                    return [2 /*return*/, e_4];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var update = undefined;
function async_check_node_update() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, check_node_update()];
                case 1:
                    update = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var rrrround, numOfFile, tmp, exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8, exp9, exp10, _loop_1, text, lines, ub, js_localunpinls, js_sclogfile, concat;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                rrrround = 5;
                numOfFile = 20;
                tmp = rrrround;
                exp1 = 0, exp2 = 0, exp3 = 0, exp4 = 0, exp5 = 0, exp6 = 0, exp7 = 0, exp8 = 0, exp9 = 0, exp10 = 0;
                _loop_1 = function () {
                    var execgen, procChildgen, textByLine, data, i_1, accounts, spt_upload, spt_flag, ept_flag, apifcnt_1, roundth, round, _loop_2, filecorrect, _loop_3, state_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                execgen = require('child_process').exec;
                                procChildgen = new Promise(function (resolve, reject) {
                                    var yourscript = execgen('ipfs pin ls -q > ../log/pinls.txt', function (error, stdout, stderr) { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            // console.log('genfile');
                                            if (error !== null) {
                                                console.log("exec error: " + error);
                                                reject(error);
                                            }
                                            resolve("" + stdout);
                                            return [2 /*return*/];
                                        });
                                    }); });
                                });
                                return [4 /*yield*/, procChildgen];
                            case 1:
                                _a.sent();
                                text = require('fs').readFileSync('../log/pinls.txt', 'utf8');
                                textByLine = text.split("\n");
                                data = "";
                                for (i_1 = 0; i_1 < numOfFile; i_1++) {
                                    //console.log(textByLine[i]);
                                    if (i_1 + 1 == numOfFile)
                                        data += textByLine[i_1];
                                    else
                                        data += textByLine[i_1] + '\n';
                                }
                                require('fs').writeFileSync(delete_File, data);
                                return [4 /*yield*/, web3.eth.getAccounts()];
                            case 2:
                                accounts = _a.sent();
                                web3.eth.defaultAccount = accounts[0];
                                spt_upload = new Date();
                                spt_flag = new Date();
                                return [4 /*yield*/, async_getstate()];
                            case 3:
                                _a.sent();
                                if (!(state.exe != web3.eth.defaultAccount && state.exe != 0x0000000000000000000000000000000000000000)) return [3 /*break*/, 4];
                                console.log("executor are occupied by %s.", state.exe);
                                return [3 /*break*/, 18];
                            case 4:
                                if (!(state.exe == 0x0000000000000000000000000000000000000000)) return [3 /*break*/, 6];
                                // console.log("try get flag-----------");
                                return [4 /*yield*/, async_getflag()];
                            case 5:
                                // console.log("try get flag-----------");
                                _a.sent();
                                return [3 /*break*/, 7];
                            case 6:
                                // console.log("already get flag-----------");
                                flag = true;
                                _a.label = 7;
                            case 7:
                                if (!(flag == undefined || flag == null)) return [3 /*break*/, 9];
                                console.log("sleep 1sec");
                                return [4 /*yield*/, delay(1000)];
                            case 8:
                                _a.sent();
                                console.log("delay get flag ...");
                                return [3 /*break*/, 7];
                            case 9:
                                ept_flag = new Date();
                                exp2 += Math.abs((+ept_flag - +spt_flag));
                                console.log("~~exp2 flag %o", +ept_flag - +spt_flag);
                                if (!(flag == true)) return [3 /*break*/, 17];
                                return [4 /*yield*/, fs.readFileSync(delete_File, 'utf-8')
                                        .split('\n')
                                        .filter(Boolean)];
                            case 10:
                                // console.log("------------obtain flag!------------");
                                lines = _a.sent();
                                apifcnt_1 = 0;
                                roundth = 0, round = ((lines.length) / 20) >> 0;
                                if (lines.length % 20 > 0)
                                    round += 1;
                                _loop_2 = function () {
                                    var spt_ipfs, i, j, cmd, filehash, ept_ipfs;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (round != 0)
                                                    ub = 20;
                                                else {
                                                    if (lines.length % 20 == 0)
                                                        ub = 20;
                                                    else
                                                        ub = lines.length % 20;
                                                }
                                                spt_ipfs = new Date();
                                                js_localunpinls = { "mode": "normal_unpin", "0": ub };
                                                // convert image to base64 encoded string
                                                for (i = roundth * 20, j = 0; i < (roundth + 1) * 20 && i < lines.length, j < ub; i++, j++) {
                                                    js_localunpinls[j + 1] = lines[i];
                                                }
                                                return [4 /*yield*/, axios.post('http://140.113.216.99:3000/ipfs/event/trigger/pinrm', js_localunpinls)
                                                        .then(function (res) {
                                                        cmd = res.data.cmd;
                                                        filehash = res.data.filehash;
                                                        apifcnt_1 = res.data.countFile;
                                                    })["catch"](function (error) {
                                                        console.error(error);
                                                    })];
                                            case 1:
                                                _a.sent();
                                                ept_ipfs = new Date();
                                                console.log("~~exp3 upload2ipfs %o", +ept_ipfs - +spt_ipfs);
                                                return [4 /*yield*/, delay(1500)];
                                            case 2:
                                                _a.sent();
                                                exp3 += Math.abs((+ept_ipfs - +spt_ipfs));
                                                js_sclogfile = {
                                                    "sender": web3.eth.defaultAccount,
                                                    "apiamount": apifcnt_1,
                                                    "fileamount": ub,
                                                    "cmd": cmd,
                                                    "filename": filehash
                                                };
                                                // console.log(js_sclogfile);
                                                fs.writeFileSync(ipfscmdtmp, JSON.stringify(js_sclogfile));
                                                // await axios.post('http://140.113.216.99:3000/ipfs/event/trigger/sc/IL/keepLog', js_sclogfile)
                                                //     .then((res) => {
                                                //         console.log(res.data);
                                                //     })
                                                //     .catch((error) => {console.error(error)});
                                                roundth++;
                                                return [2 /*return*/];
                                        }
                                    });
                                };
                                _a.label = 11;
                            case 11:
                                if (!round--) return [3 /*break*/, 13];
                                return [5 /*yield**/, _loop_2()];
                            case 12:
                                _a.sent();
                                return [3 /*break*/, 11];
                            case 13:
                                filecorrect = false;
                                _loop_3 = function () {
                                    var spt_sgx, exec, procChild, tmpResult, _a, _b, ept_sgx, spt_SCipfslog, ept_SCipfslog, sig_m, sig_f, spt_SCfac, ept_SCfac, ept_all, spt_update, ept_all2update, ept_update, spt_selfheal, ept_selfheal;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                spt_sgx = new Date();
                                                exec = require('child_process').exec;
                                                procChild = new Promise(function (resolve, reject) {
                                                    // const yourscript = exec('cd ../sgx/ && ./runner app.sgxs > ../uploadts_test/sgx_out.json', async (error, stdout, stderr) => {
                                                    var yourscript = exec('cd ../../src/sgx/ && ./runner app.sgxs', function (error, stdout, stderr) { return __awaiter(void 0, void 0, void 0, function () {
                                                        return __generator(this, function (_a) {
                                                            // console.log('------running in sgx-----');
                                                            if (error !== null) {
                                                                console.log("exec error: " + error);
                                                                reject(error);
                                                            }
                                                            resolve("" + stdout);
                                                            return [2 /*return*/];
                                                        });
                                                    }); });
                                                });
                                                _b = (_a = JSON).parse;
                                                return [4 /*yield*/, procChild];
                                            case 1:
                                                tmpResult = _b.apply(_a, [_c.sent()]);
                                                ept_sgx = new Date();
                                                console.log("~~exp4 sgx %o", +ept_sgx - +spt_sgx);
                                                exp4 += Math.abs((+ept_sgx - +spt_sgx));
                                                if (!(tmpResult.check == "true")) return [3 /*break*/, 15];
                                                concat = {};
                                                concat = jsonConcat(jsonConcat(concat, tmpResult), js_sclogfile);
                                                spt_SCipfslog = new Date();
                                                return [4 /*yield*/, axios.post('http://140.113.216.99:3000/ipfs/event/trigger/sc/IL/keepLog', concat)
                                                        .then(function (res) {
                                                        if (res.data == "Signature verification falied!") {
                                                            console.log("msg source might not be SGX");
                                                            return;
                                                        }
                                                    })["catch"](function (error) { console.error(error); })];
                                            case 2:
                                                _c.sent();
                                                ept_SCipfslog = new Date();
                                                console.log("~~exp5 sc ipfslog %o", +ept_SCipfslog - +spt_SCipfslog);
                                                exp5 += Math.abs((+ept_SCipfslog - +spt_SCipfslog));
                                                sig_m = ethers.utils.splitSignature(tmpResult.sig);
                                                sig_f = ethers.utils.splitSignature(tmpResult.sig_cnt);
                                                spt_SCfac = new Date();
                                                return [4 /*yield*/, async_setFAC(tmpResult.msg, sig_m, tmpResult.cnt, sig_f)];
                                            case 3:
                                                _c.sent();
                                                if (!(set_done.events.Log_file.returnValues.succeed_or_not == true)) return [3 /*break*/, 7];
                                                ept_SCfac = new Date();
                                                console.log("~~exp6 sc setfac %o", +ept_SCfac - +spt_SCfac);
                                                exp6 += Math.abs((+ept_SCfac - +spt_SCfac));
                                                ept_all = new Date();
                                                console.log("~~exp7 upload done %o", +ept_all - +spt_upload);
                                                exp7 += Math.abs((+ept_all - +spt_upload));
                                                filecorrect = true;
                                                spt_update = new Date();
                                                _c.label = 4;
                                            case 4:
                                                if (!1) return [3 /*break*/, 6];
                                                return [4 /*yield*/, async_check_node_update()];
                                            case 5:
                                                _c.sent();
                                                if (update == true) {
                                                    ept_all2update = new Date();
                                                    console.log("~~exp8 upload+all nodes updated %o", +ept_all2update - +spt_upload);
                                                    exp8 += Math.abs((+ept_all2update - +spt_upload));
                                                    ept_update = new Date();
                                                    console.log("~~exp9 all nodes updated %o", +ept_update - +spt_update);
                                                    exp9 += Math.abs((+ept_update - +spt_update));
                                                    return [3 /*break*/, 6];
                                                }
                                                return [3 /*break*/, 4];
                                            case 6: return [2 /*return*/, "break"];
                                            case 7:
                                                if (!(set_done.events.Log_file.returnValues.memo === "FCNT_NOTMATCH")) return [3 /*break*/, 13];
                                                console.log(set_done.events.Log_file.returnValues.memo);
                                                console.log(set_done.events.File.returnValues);
                                                spt_selfheal = new Date();
                                                return [4 /*yield*/, async_self_healing()];
                                            case 8:
                                                if (!_c.sent()) return [3 /*break*/, 11];
                                                return [4 /*yield*/, axios.post('http://140.113.216.99:3000/ipfs/event/trigger/pinrm', unpin_list)
                                                        .then(function (res) { })["catch"](function (error) { console.error(error); })];
                                            case 9:
                                                _c.sent();
                                                ept_selfheal = new Date();
                                                console.log("~~exp10 sc all update %o", +ept_selfheal - +spt_selfheal);
                                                exp10 += Math.abs((+ept_selfheal - +spt_selfheal));
                                                return [4 /*yield*/, delay(1000)];
                                            case 10:
                                                _c.sent();
                                                return [3 /*break*/, 12];
                                            case 11:
                                                console.log("failed to perform self healing ");
                                                _c.label = 12;
                                            case 12:
                                                filecorrect = false;
                                                return [3 /*break*/, 14];
                                            case 13:
                                                console.log(set_done.events.Log_file.returnValues.memo);
                                                filecorrect = true;
                                                return [2 /*return*/, "break"];
                                            case 14: return [3 /*break*/, 16];
                                            case 15:
                                                console.log("IPFS code has been compormised");
                                                _c.label = 16;
                                            case 16: return [2 /*return*/];
                                        }
                                    });
                                };
                                _a.label = 14;
                            case 14:
                                if (!(filecorrect == false)) return [3 /*break*/, 16];
                                return [5 /*yield**/, _loop_3()];
                            case 15:
                                state_2 = _a.sent();
                                if (state_2 === "break")
                                    return [3 /*break*/, 16];
                                return [3 /*break*/, 14];
                            case 16: return [3 /*break*/, 18];
                            case 17:
                                console.log("failed to get flag, please check log file or try later!");
                                _a.label = 18;
                            case 18:
                                console.log("end");
                                return [2 /*return*/];
                        }
                    });
                };
                _a.label = 1;
            case 1:
                if (!tmp--) return [3 /*break*/, 3];
                return [5 /*yield**/, _loop_1()];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3:
                console.log("exp2:%o s", Math.abs(exp2 / (1000)) / rrrround);
                console.log("exp3:%o s", Math.abs(exp3 / (1000)) / rrrround);
                console.log("exp4:%o s", Math.abs(exp4 / (1000)) / rrrround);
                console.log("exp5:%o s", Math.abs(exp5 / (1000)) / rrrround);
                console.log("exp6:%o s", Math.abs(exp6 / (1000)) / rrrround);
                console.log("exp7:%o s", Math.abs(exp7 / (1000)) / rrrround);
                console.log("exp8:%o s", Math.abs(exp8 / (1000)) / rrrround);
                console.log("exp9:%o s", Math.abs(exp9 / (1000)) / rrrround);
                console.log("exp10:%o s", Math.abs(exp10 / (1000)) / rrrround);
                return [2 /*return*/];
        }
    });
}); })();
