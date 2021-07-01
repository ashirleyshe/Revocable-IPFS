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
var api_cmd_log = '../log/api_cmd_log.out';
var local_ls_log = '../log/local_pinls.out';
var FSjson = '../../src/contracts/FACSync.json';
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
var ethereumUri = 'http://140.113.216.126:8547';
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(ethereumUri));
/* contract info */
var FScontract = JSON.parse(fs.readFileSync(FSjson, 'utf8'));
var FSabi = FScontract.abi;
var FSaddr = '0xe9911422941c4474c49f963e0dd9aad63f288c03'; //master flag
var FSinstance = new web3.eth.Contract(FSabi, FSaddr);
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
function renewFAC(msg, sigm, cnt, sigf) {
    return __awaiter(this, void 0, void 0, function () {
        var setFstate, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, FSinstance.methods.updateFAC(msg, sigm.v, sigm.r, sigm.s, cnt, sigf.v, sigf.r, sigf.s).send({ from: web3.eth.defaultAccount })];
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
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function get_nodestatus(cur_time) {
    return __awaiter(this, void 0, void 0, function () {
        var n_res, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, FSinstance.methods.get_nodestatus(cur_time).call()];
                case 1:
                    n_res = _a.sent();
                    return [2 /*return*/, n_res];
                case 2:
                    e_4 = _a.sent();
                    console.log("get_nodestatus: %o", e_4);
                    return [2 /*return*/, e_4];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var nstatus = undefined;
function async_get_nodestatus(cur_time) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_nodestatus(cur_time)];
                case 1:
                    nstatus = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function check_node_update() {
    return __awaiter(this, void 0, void 0, function () {
        var state_1, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, FSinstance.methods.check_all_update().call()];
                case 1:
                    state_1 = _a.sent();
                    return [2 /*return*/, state_1];
                case 2:
                    e_5 = _a.sent();
                    console.log("check_node_update: %o", e_5);
                    return [2 /*return*/, e_5];
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
function async_renewFAC(msg, sigm, cnt, sigf) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, renewFAC(msg, sigm, cnt, sigf)];
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
                case 0:
                    console.log("self healing process------");
                    return [4 /*yield*/, async_get_api_cmd_log()];
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
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var accounts, old_ts, filecorrect, _loop_1, state_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, web3.eth.getAccounts()];
            case 1:
                accounts = _a.sent();
                web3.eth.defaultAccount = accounts[0];
                console.log(web3.eth.defaultAccount);
                old_ts = Number(0);
                _a.label = 2;
            case 2:
                if (!1) return [3 /*break*/, 23];
                _a.label = 3;
            case 3:
                if (!1) return [3 /*break*/, 22];
                return [4 /*yield*/, async_getstate()];
            case 4:
                _a.sent();
                // check timstamp and uploader address
                return [4 /*yield*/, async_check_node_update()];
            case 5:
                // check timstamp and uploader address
                _a.sent();
                console.log(update); //true all node updated false not update yet
                if (!update) return [3 /*break*/, 6];
                old_ts = Number(state.curts_index);
                return [3 /*break*/, 11];
            case 6: return [4 /*yield*/, async_get_nodestatus(Number(state.curts_index))];
            case 7:
                _a.sent();
                if (!(nstatus.correct == 0)) return [3 /*break*/, 8];
                old_ts = Number(0);
                return [3 /*break*/, 11];
            case 8:
                if (!(nstatus.correct == 1 && state.current_exe == web3.eth.defaultAccount)) return [3 /*break*/, 10];
                old_ts = Number(state.curts_index);
                console.log("changes are made by me, sleep 5 sec for others to update......");
                return [4 /*yield*/, delay(5000)];
            case 9:
                _a.sent();
                return [3 /*break*/, 3];
            case 10:
                console.log("others haven't complete update!");
                _a.label = 11;
            case 11: return [4 /*yield*/, async_getstate()];
            case 12:
                _a.sent();
                console.log(old_ts);
                if (!(Number(old_ts) < Number(state.curts_index))) return [3 /*break*/, 19];
                console.log("changes has been detected------");
                if (!(state.current_exe != web3.eth.defaultAccount)) return [3 /*break*/, 16];
                console.log("changes are made by others......");
                console.log("------------start update!------------");
                filecorrect = false;
                _loop_1 = function () {
                    var exec, procChild, tmpResult, _a, _b, sig_m, sig_f, wt;
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
                                console.log(tmpResult);
                                sig_m = ethers.utils.splitSignature(tmpResult.sig);
                                sig_f = ethers.utils.splitSignature(tmpResult.sig_cnt);
                                wt = Math.floor(Math.random() * 500) + 0;
                                return [4 /*yield*/, delay(wt)];
                            case 2:
                                _c.sent();
                                console.log(wt);
                                return [4 /*yield*/, async_renewFAC(tmpResult.msg, sig_m, tmpResult.cnt, sig_f)];
                            case 3:
                                _c.sent();
                                if (set_done == undefined)
                                    return [2 /*return*/, "break"];
                                console.log(set_done.events);
                                if (!(set_done.events.Log_file.returnValues.succeed_or_not == true)) return [3 /*break*/, 4];
                                console.log("SET_SUCCEED");
                                filecorrect = true;
                                return [2 /*return*/, "break"];
                            case 4:
                                if (!(set_done.events.Log_file.returnValues.memo === "FCNT_NOTMATCH")) return [3 /*break*/, 10];
                                console.log(set_done.events.Log_file.returnValues.memo);
                                console.log(set_done.events.File.returnValues);
                                return [4 /*yield*/, async_self_healing()];
                            case 5:
                                if (!_c.sent()) return [3 /*break*/, 8];
                                return [4 /*yield*/, axios.post('http://140.113.216.99:3000/ipfs/event/trigger/pinrm', unpin_list)
                                        .then(function (res) { })["catch"](function (error) { console.error(error); })];
                            case 6:
                                _c.sent();
                                // wait for all file unpin 
                                return [4 /*yield*/, delay(1500)];
                            case 7:
                                // wait for all file unpin 
                                _c.sent();
                                return [3 /*break*/, 9];
                            case 8:
                                console.log("false");
                                _c.label = 9;
                            case 9:
                                filecorrect = false;
                                return [3 /*break*/, 11];
                            case 10:
                                console.log(set_done.events.Log_file.returnValues.memo);
                                filecorrect = true;
                                return [2 /*return*/, "break"];
                            case 11: return [2 /*return*/];
                        }
                    });
                };
                _a.label = 13;
            case 13:
                if (!(filecorrect == false)) return [3 /*break*/, 15];
                return [5 /*yield**/, _loop_1()];
            case 14:
                state_2 = _a.sent();
                if (state_2 === "break")
                    return [3 /*break*/, 15];
                return [3 /*break*/, 13];
            case 15:
                old_ts = Number(state.curts_index);
                return [3 /*break*/, 18];
            case 16:
                console.log("changes are made by me, sleep 10 sec for others to update......");
                return [4 /*yield*/, delay(10000)];
            case 17:
                _a.sent();
                return [3 /*break*/, 3];
            case 18: return [3 /*break*/, 21];
            case 19:
                console.log("no changes being made check 0.1sec later........");
                return [4 /*yield*/, delay(100)];
            case 20:
                _a.sent();
                return [3 /*break*/, 3];
            case 21: return [3 /*break*/, 22];
            case 22: return [3 /*break*/, 2];
            case 23: return [2 /*return*/];
        }
    });
}); })();
