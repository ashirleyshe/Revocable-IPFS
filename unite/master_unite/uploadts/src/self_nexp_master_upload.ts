const uploadFolder = '../uploadFiles/';
const api_cmd_log = '../log/api_cmd_log.out';
const local_ls_log = '../log/local_pinls.out';
const FSjson = '../../src/contracts/FACSync.json';
// const uploadFolder = './large_file/';
const ipfscmdtmp = '../log/ipfsCmdTmp.json';
import fs = require('fs');
const files = fs.readdirSync(uploadFolder);
// const json_info = './json_info.json';
const axios = require('axios');
import ethers = require('ethers');

/*ipfs*/
import ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('http://localhost:5001')
/* For smart contract use */
const Web3 = require('web3');
//remember change to current geth node [ip:port]
const ethereumUri = 'http://140.113.216.99:8545';
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(ethereumUri));
/* contract info */
const FScontract = JSON.parse(fs.readFileSync(FSjson, 'utf8'));
const FSabi = FScontract.abi;
// 15 
const FSaddr = '0x8904ce9c435543faba4474e03d40f368af4fef38'; //master flag 
// 5
// const FSaddr = '0xe9911422941c4474c49f963e0dd9aad63f288c03'; //master flag
const FSinstance = new web3.eth.Contract(FSabi, FSaddr);




function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return Buffer.from(bitmap).toString('base64');
}

async function async_get_local_pinls() {
    const local_pinls = await ipfs.pin.ls();
    let logger = fs.createWriteStream(local_ls_log, { flags: 'w' });
    for (const value of local_pinls) {
        logger.write(value.hash + '\n');
    }
    logger.end();
}

let cmd_logs;
async function async_get_api_cmd_log() {
    await axios.get('http://140.113.216.99:3000/ipfs/event/trigger/sc/IL/getALog')
        .then((res) => {
            let count = Object.keys(res.data).length;
            let logger = fs.createWriteStream(api_cmd_log, { flags: 'w' });
            for (let i = 0; i < count; i++) {
                //console.log(res.data[count-1].returnValues);
                logger.write(res.data[i].returnValues.cmd + ',' + res.data[i].returnValues.filename + '\n');
            }
            logger.end();
        })
        .catch((error) => {
            console.error(error)
        });
}

let unpin_list;
async function async_get_unpin_list() {
    let com_result = false
    const exec = require('child_process').exec;
    const procChild = new Promise<any>((resolve, reject) => {
        const yourscript = exec('python comp.py', async (error, stdout, stderr) => {
            // console.log('------running comp.py-----');
            if (error !== null) {
                console.log(`exec error: ${error}`);
                reject(error);
            }
            console.log(`${stdout}`)
            resolve(`${stdout}`);
        });
    });
    try {
        unpin_list = JSON.parse(await procChild);
        // console.log("unpin list: %o",unpin_list);
        com_result = true;
    }
    catch (e) {
        com_result = false;
    }
    return com_result;
}

async function set_FAC(msg: any, sigm: any, cnt: any, sigf: any): Promise<any> {
    let setFstate;
    try {
        setFstate = await FSinstance.methods.setFAC(msg, sigm.v, sigm.r, sigm.s, cnt, sigf.v, sigf.r, sigf.s).send({ from: web3.eth.defaultAccount });
    } catch (e) {
        return setFstate;
    }
    return setFstate;
}

async function get_state(): Promise<any> {
    let state;
    try {
        state = await FSinstance.methods.getStat().call();
    } catch (e) {
        console.log("get_state: %o", e);
        return e;
    }
    return state;
}

async function get_flag(): Promise<any> {
    // console.log(web3.eth.defaultAccount);
    const flag = await FSinstance.methods.getFlag().send({ from: web3.eth.defaultAccount });
    if (flag.events.Log_file.returnValues.succeed_or_not === false) {
        // console.log("failed to set flag");
        // console.log(flag.events.Log_file.returnValues);
        return flag.events.Log_file.returnValues;
    } else
        return flag.events.Log_file.returnValues.succeed_or_not;
}

let flag;
async function async_getflag() {
    flag = await get_flag();
}

let state;
async function async_getstate() {
    state = await get_state();
    // console.log("state: %o", state);
}

let set_done;
async function async_setFAC(msg: any, sigm: any, cnt: any, sigf: any) {
    set_done = await set_FAC(msg, sigm, cnt, sigf);
    // console.log("set_done: %o", set_done.events);
}

async function async_self_healing() {
    await async_get_api_cmd_log();
    await async_get_local_pinls();
    return await async_get_unpin_list();
}

function jsonConcat(o1, o2) {
    for (var key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}

/*exp*/
async function check_node_update(): Promise<any> {
    try {
        const state = await FSinstance.methods.check_all_update().call();
        return state;
    } catch (e) {
        // console.log("check_node_update: %o", e);
        return e;
    }
}

let update = undefined;
async function async_check_node_update() {
    update = await check_node_update();
}





(async () => {
    let rrrround = 1;
    let tmp = rrrround;
    let exp1 = 0, exp2 = 0, exp3 = 0, exp4 = 0, exp5 = 0, exp6 = 0, exp7 = 0, exp8 = 0, exp9 = 0, exp10 = 0;
    while (tmp--) {

        const execgen = require('child_process').exec;
        const procChildgen = new Promise<any>((resolve, reject) => {
            // const yourscript = exec('cd ../sgx/ && ./runner app.sgxs > ../uploadts_test/sgx_out.json', async (error, stdout, stderr) => {
            const yourscript = execgen('cd ../uploadFiles && rm * && cd .. && ./genfile.sh', async (error, stdout, stderr) => {
                // console.log('genfile');
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                    reject(error);
                }
                resolve(`${stdout}`);
            });
        });




        await procChildgen;


        //check if [0] aren't 0
        const accounts = await web3.eth.getAccounts();
        web3.eth.defaultAccount = accounts[0];
        // console.log(web3.eth.defaultAccount);
        let spt_upload = new Date();
        let spt_flag = new Date();
        await async_getstate();
        if ((state.exe != web3.eth.defaultAccount && state.exe != 0x0000000000000000000000000000000000000000))
            console.log("executor are occupied by %s.", state.exe);
        else {
            if (state.exe == 0x0000000000000000000000000000000000000000) {
                //console.log("try get flag-----------");
                await async_getflag();
            }
            else {
                // console.log("already get flag-----------");
                flag = true;
            }

            //only when try get flag haven't done will in while    
            while (flag == undefined || flag == null) {
                // console.log("sleep 1sec");
                await delay(1000);
                // console.log("delay get flag ...");
            }

            let ept_flag = new Date();
            exp2 += Math.abs((+ept_flag - +spt_flag));
            console.log("~~exp2 flag %o", +ept_flag - +spt_flag);

            if (flag == true) {
                // console.log("------------obtain flag!------------");
                let roundth = 0, round = ((files.length) / 20) >> 0;
                if (files.length % 20 > 0)
                    round += 1;
                let apifcnt;

                //upload ipfs files 20at a time
                while (round--) {
                    if (round != 0)
                        ub = 20;
                    else {
                        if (files.length % 20 == 0)
                            ub = 20;
                        else
                            ub = files.length % 20;
                    }
                    let spt_ipfs = new Date();
                    var ub, js_uploadbase = { "0": ub };
                    // convert image to base64 encoded string
                    for (var i = roundth * 20, j = 0; i < (roundth + 1) * 20 && i < files.length, j < ub; i++ , j++) {
                        const base64str = base64_encode(uploadFolder + files[i]);
                        js_uploadbase[j + 1] = base64str;
                    }

                    //post file to api
                    let cmd, filehash;
                    await axios.post('http://140.113.216.99:3000/ipfs/event/trigger/pinadd', js_uploadbase)
                        .then((res) => {
                            cmd = res.data.cmd;
                            filehash = res.data.filehash;
                            apifcnt = res.data.countFile;
                        })
                        .catch((error) => {
                            console.error(error)
                        });
                    let ept_ipfs = new Date();
                    console.log("~~exp3 upload2ipfs %o", +ept_ipfs - +spt_ipfs);
                    exp3 += Math.abs((+ept_ipfs - +spt_ipfs));

                    var js_sclogfile = {
                        "sender": web3.eth.defaultAccount,
                        "apiamount": apifcnt,
                        "fileamount": ub,
                        "cmd": cmd,
                        "filename": filehash
                    };


                    // console.log(js_sclogfile);

                    fs.writeFileSync(ipfscmdtmp, JSON.stringify(js_sclogfile));

                    /*
                        await axios.post('http://140.113.216.99:3000/ipfs/event/trigger/sc/IL/keepLog', js_sclogfile)
                            .then((res) => {
                            // console.log(res.data);
                            })
                            .catch((error) => {console.error(error)});
                    */
                    roundth++;
                }

                let filecorrect = false;
                while (filecorrect == false) {

                    // run sgx to get pin ls (try to do it here)
                    let spt_sgx = new Date();
                    const exec = require('child_process').exec;
                    const procChild = new Promise<any>((resolve, reject) => {
                        // const yourscript = exec('cd ../sgx/ && ./runner app.sgxs > ../uploadts_test/sgx_out.json', async (error, stdout, stderr) => {
                        const yourscript = exec('cd ../../src/sgx/ && ./runner app.sgxs', async (error, stdout, stderr) => {
                            // console.log('------running in sgx-----');
                            if (error !== null) {
                                console.log(`exec error: ${error}`);
                                reject(error);
                            }
                            resolve(`${stdout}`);
                        });
                    });

                    let tmpResult = JSON.parse(await procChild);
                    //console.log(tmpResult);
                    let ept_sgx = new Date();
                    console.log("~~exp4 sgx %o", +ept_sgx - +spt_sgx);
                    exp4 += Math.abs((+ept_sgx - +spt_sgx));
                    if (tmpResult.check == "true") {
                        var concat = {};
                        concat = jsonConcat(jsonConcat(concat, tmpResult), js_sclogfile);
                        // console.log(concat);

                        let spt_SCipfslog = new Date();
                        await axios.post('http://140.113.216.99:3000/ipfs/event/trigger/sc/IL/keepLog', concat)
                            .then((res) => {
                                if (res.data == "Signature verification falied!") {
                                    console.log("msg source might not be SGX");
                                    return;
                                }
                            })
                            .catch((error) => { console.error(error) });
                        let ept_SCipfslog = new Date();
                        console.log("~~exp5 sc ipfslog %o", +ept_SCipfslog - +spt_SCipfslog);
                        exp5 += Math.abs((+ept_SCipfslog - +spt_SCipfslog));
                        const sig_m = ethers.utils.splitSignature(tmpResult.sig);
                        const sig_f = ethers.utils.splitSignature(tmpResult.sig_cnt);
                        let spt_SCfac = new Date();
                        await async_setFAC(tmpResult.msg, sig_m, tmpResult.cnt, sig_f);

                        if (set_done.events.Log_file.returnValues.succeed_or_not == true) {
                            //console.log("SET_SUCCEED");
                            let ept_SCfac = new Date();
                            console.log("~~exp6 sc setfac %o", +ept_SCfac - +spt_SCfac);
                            exp6 += Math.abs((+ept_SCfac - +spt_SCfac));
                            let ept_all = new Date();
                            console.log("~~exp7 upload done %o", +ept_all - +spt_upload);
                            exp7 += Math.abs((+ept_all - +spt_upload));

                            filecorrect = true;
                            /*for exp*/
                            let spt_update = new Date();
                            while (1) {
                                await async_check_node_update();
                                if (update == true) {
                                    let ept_all2update = new Date();
                                    console.log("~~exp8 upload+all nodes updated %o", +ept_all2update - +spt_upload);
                                    exp8 += Math.abs((+ept_all2update - +spt_upload));
                                    let ept_update = new Date();
                                    console.log("~~exp9 all nodes updated %o", +ept_update - +spt_update);
                                    exp9 += Math.abs((+ept_update - +spt_update));
                                    break;
                                }
                            }
                            break;
                        }
                        else {
                            if (set_done.events.Log_file.returnValues.memo === "FCNT_NOTMATCH") {
                                console.log(set_done.events.Log_file.returnValues.memo);
                                console.log(set_done.events.File.returnValues)
                                let spt_selfheal = new Date();

                                if (await async_self_healing()) {
                                    await axios.post('http://140.113.216.99:3000/ipfs/event/trigger/pinrm', unpin_list)
                                        .then((res: any) => { })
                                        .catch((error: any) => { console.error(error) });
                                    let ept_selfheal = new Date();
                                    console.log("~~exp10 sc all update %o", +ept_selfheal - +spt_selfheal);
                                    exp10 += Math.abs((+ept_selfheal - +spt_selfheal));
                                    // wait for all file unpin 
                                    await delay(1000);
                                }
                                else
                                    console.log("failed to perform self healing ");
                                filecorrect = false;

                            }
                            else {
                                console.log(set_done.events.Log_file.returnValues.memo);
                                filecorrect = true;
                                break;
                            }
                        }
                    }
                    else {
                        console.log("IPFS code has been compormised");
                    }

                }
            }
            else {
                console.log("failed to get flag, please check log file or try later!");
            }

        }
        console.log("end");
    }

    console.log("exp2:%o s", Math.abs(exp2 / (1000)) / rrrround);
    console.log("exp3:%o s", Math.abs(exp3 / (1000)) / rrrround);
    console.log("exp4:%o s", Math.abs(exp4 / (1000)) / rrrround);
    console.log("exp5:%o s", Math.abs(exp5 / (1000)) / rrrround);
    console.log("exp6:%o s", Math.abs(exp6 / (1000)) / rrrround);
    console.log("exp7:%o s", Math.abs(exp7 / (1000)) / rrrround);
    console.log("exp8:%o s", Math.abs(exp8 / (1000)) / rrrround);
    console.log("exp9:%o s", Math.abs(exp9 / (1000)) / rrrround);
    console.log("exp10:%o s", Math.abs(exp10 / (1000)) / rrrround);

})();



