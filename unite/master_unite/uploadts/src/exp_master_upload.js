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
var uploadFolder = '../uploadFiles/';
var api_cmd_log = '../log/api_cmd_log.out';
var local_ls_log = '../log/local_pinls.out';
var FSjson = '../../src/contracts/FACSync.json';
// const uploadFolder = './large_file/';
var fs = require("fs");
var files = fs.readdirSync(uploadFolder);
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
var FSaddr = '0xd6e21e72c33ad7d0fda5c4bc4d72a586972b987a'; //master flag
var FSinstance = new web3.eth.Contract(FSabi, FSaddr);
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return Buffer.from(bitmap).toString('base64');
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
                                console.log('------running comp.py-----');
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
                    console.log(unpin_list);
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
                case 0:
                    // web3.eth.defaultAccount = body.account;
                    console.log(web3.eth.defaultAccount);
                    return [4 /*yield*/, FSinstance.methods.getFlag().send({ from: web3.eth.defaultAccount })];
                case 1:
                    flag = _a.sent();
                    if (flag.events.Log_file.returnValues.succeed_or_not === false) {
                        console.log("failed to set flag in function");
                        console.log(flag.events.Log_file.returnValues);
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
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
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
                    console.log("state: %o", state);
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
                    console.log("check_node_update: %o", e_4);
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
    var accounts, startpt_exp12, roundth, round, apifcnt_1, startpt_exp7, _loop_1, ub, js_uploadbase, js_sclogfile, endpt_exp7, filecorrect, _loop_2, state_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, web3.eth.getAccounts()];
            case 1:
                accounts = _a.sent();
                web3.eth.defaultAccount = accounts[0];
                console.log(web3.eth.defaultAccount);
                return [4 /*yield*/, async_getstate()];
            case 2:
                _a.sent();
                if (!(state.exe != web3.eth.defaultAccount && state.exe != 0x0000000000000000000000000000000000000000)) return [3 /*break*/, 3];
                console.log("executor are occupied by %s.", state.exe);
                return [3 /*break*/, 16];
            case 3:
                startpt_exp12 = new Date();
                console.log("~~~~~~~~ startpt_exp12 %o ~~~~~~~~~~~~~", startpt_exp12);
                if (!(state.exe == 0x0000000000000000000000000000000000000000)) return [3 /*break*/, 5];
                console.log("try get flag-----------");
                return [4 /*yield*/, async_getflag()];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                console.log("already get flag-----------");
                flag = true;
                _a.label = 6;
            case 6:
                if (!(flag == undefined || flag == null)) return [3 /*break*/, 8];
                console.log("sleep 1sec");
                return [4 /*yield*/, delay(1000)];
            case 7:
                _a.sent();
                console.log("delay get flag ...");
                return [3 /*break*/, 6];
            case 8:
                if (!(flag == true)) return [3 /*break*/, 15];
                console.log("------------obtain flag!------------");
                roundth = 0, round = ((files.length) / 20) >> 0;
                if (files.length % 20 > 0)
                    round += 1;
                startpt_exp7 = new Date();
                console.log("~~~~~~~~ startpt_exp7 %o ~~~~~~~~~~~~~", startpt_exp7);
                _loop_1 = function () {
                    var i, j, base64str, cmd, filehash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (round != 0)
                                    ub = 20;
                                else {
                                    if (files.length % 20 == 0)
                                        ub = 20;
                                    else
                                        ub = files.length % 20;
                                }
                                js_uploadbase = { "0": ub };
                                // convert image to base64 encoded string
                                for (i = roundth * 20, j = 0; i < (roundth + 1) * 20 && i < files.length, j < ub; i++, j++) {
                                    base64str = base64_encode(uploadFolder + files[i]);
                                    js_uploadbase[j + 1] = base64str;
                                }
                                return [4 /*yield*/, axios.post('http://140.113.216.99:3000/ipfs/event/trigger/pinadd', js_uploadbase)
                                        .then(function (res) {
                                        cmd = res.data.cmd;
                                        filehash = res.data.filehash;
                                        apifcnt_1 = res.data.countFile;
                                    })["catch"](function (error) {
                                        console.error(error);
                                    })];
                            case 1:
                                _a.sent();
                                // console.log(cmd);
                                // console.log(filehash);
                                // console.log(apifcnt);
                                js_sclogfile = { "sender": web3.eth.defaultAccount,
                                    "apiamount": apifcnt_1,
                                    "fileamount": ub,
                                    "cmd": cmd,
                                    "filename": filehash };
                                console.log(js_sclogfile);
                                return [4 /*yield*/, axios.post('http://140.113.216.99:3000/ipfs/event/trigger/sc/IL/keepLog', js_sclogfile)
                                        .then(function (res) {
                                        // console.log(res.data);
                                    })["catch"](function (error) { console.error(error); })];
                            case 2:
                                _a.sent();
                                roundth++;
                                return [2 /*return*/];
                        }
                    });
                };
                _a.label = 9;
            case 9:
                if (!round--) return [3 /*break*/, 11];
                return [5 /*yield**/, _loop_1()];
            case 10:
                _a.sent();
                return [3 /*break*/, 9];
            case 11:
                endpt_exp7 = new Date();
                console.log("~~~~~~~~ endpt_exp7 %o ~~~~~~~~~~~~~", endpt_exp7);
                console.log("~~~~~~~~ exp7(u)    %o ~~~~~~~~~~~~~", +endpt_exp7 - +startpt_exp7);
                filecorrect = false;
                _loop_2 = function () {
                    var exec, procChild, tmpResult, _a, _b, sig_m, sig_f, startpt_exp5, endpt_exp5, endpt_exp1, endpt_exp2, startpt_exp8, endpt_exp8;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                exec = require('child_process').exec;
                                procChild = new Promise(function (resolve, reject) {
                                    // const yourscript = exec('cd ../sgx/ && ./runner app.sgxs > ../uploadts_test/sgx_out.json', async (error, stdout, stderr) => {
                                    var yourscript = exec('cd ../../src/sgx/ && ./runner app.sgxs', function (error, stdout, stderr) { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            console.log('------running in sgx-----');
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
                                sig_m = ethers.utils.splitSignature(tmpResult.sig);
                                sig_f = ethers.utils.splitSignature(tmpResult.sig_cnt);
                                startpt_exp5 = new Date();
                                console.log("~~~~~~~~ startpt_exp5 %o ~~~~~~~~~~~~~", startpt_exp5);
                                return [4 /*yield*/, async_setFAC(tmpResult.msg, sig_m, tmpResult.cnt, sig_f)];
                            case 2:
                                _c.sent();
                                endpt_exp5 = new Date();
                                console.log("~~~~~~~~ endpt_exp5 %o ~~~~~~~~~~~~~", endpt_exp5);
                                console.log("~~~~~~~~ exp5(u) %o ~~~~~~~~~~~~~", +endpt_exp5 - +startpt_exp5);
                                if (!(set_done.events.Log_file.returnValues.succeed_or_not == true)) return [3 /*break*/, 6];
                                endpt_exp1 = new Date();
                                console.log("~~~~~~~~ endpt_exp1 %o ~~~~~~~~~~~~~", endpt_exp1);
                                console.log("~~~~~~~~ exp1 %o ~~~~~~~~~~~~~", +endpt_exp1 - +startpt_exp12);
                                console.log("SET_SUCCEED");
                                filecorrect = true;
                                _c.label = 3;
                            case 3:
                                if (!1) return [3 /*break*/, 5];
                                return [4 /*yield*/, async_check_node_update()];
                            case 4:
                                _c.sent();
                                if (update == true)
                                    return [3 /*break*/, 5];
                                return [3 /*break*/, 3];
                            case 5:
                                endpt_exp2 = new Date();
                                console.log("~~~~~~~~ endpt_exp2 %o ~~~~~~~~~~~~~", endpt_exp2);
                                console.log("~~~~~~~~ exp2 %o ~~~~~~~~~~~~~", +endpt_exp2 - +startpt_exp12);
                                console.log("~~~~~~~~ exp6(u) %o ~~~~~~~~~~~~~", +endpt_exp2 - +endpt_exp1);
                                return [2 /*return*/, "break"];
                            case 6:
                                if (!(set_done.events.Log_file.returnValues.memo === "FCNT_NOTMATCH")) return [3 /*break*/, 12];
                                console.log(set_done.events.Log_file.returnValues.memo);
                                console.log(set_done.events.File.returnValues);
                                startpt_exp8 = new Date();
                                console.log("~~~~~~~~ startpt_exp8 %o ~~~~~~~~~~~~~", startpt_exp8);
                                return [4 /*yield*/, async_self_healing()];
                            case 7:
                                if (!_c.sent()) return [3 /*break*/, 10];
                                return [4 /*yield*/, axios.post('http://140.113.216.99:3000/ipfs/event/trigger/pinrm', unpin_list)
                                        .then(function (res) { })["catch"](function (error) { console.error(error); })];
                            case 8:
                                _c.sent();
                                endpt_exp8 = new Date();
                                console.log("~~~~~~~~ endpt_exp8 %o ~~~~~~~~~~~~~", endpt_exp8);
                                console.log("~~~~~~~~ exp8(d) %o ~~~~~~~~~~~~~", +endpt_exp8 - +startpt_exp8);
                                // wait for all file unpin 
                                return [4 /*yield*/, delay(1500)];
                            case 9:
                                // wait for all file unpin 
                                _c.sent();
                                return [3 /*break*/, 11];
                            case 10:
                                console.log("failed to perform self healing ");
                                _c.label = 11;
                            case 11:
                                filecorrect = false;
                                return [3 /*break*/, 13];
                            case 12:
                                console.log(set_done.events.Log_file.returnValues.memo);
                                filecorrect = true;
                                return [2 /*return*/, "break"];
                            case 13: return [2 /*return*/];
                        }
                    });
                };
                _a.label = 12;
            case 12:
                if (!(filecorrect == false)) return [3 /*break*/, 14];
                return [5 /*yield**/, _loop_2()];
            case 13:
                state_2 = _a.sent();
                if (state_2 === "break")
                    return [3 /*break*/, 14];
                return [3 /*break*/, 12];
            case 14: return [3 /*break*/, 16];
            case 15:
                console.log("failed to get flag, please check log file or try later!");
                _a.label = 16;
            case 16:
                //await async_getstate();
                console.log("end");
                return [2 /*return*/];
        }
    });
}); })();
