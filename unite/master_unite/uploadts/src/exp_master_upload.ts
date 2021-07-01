const uploadFolder = '../uploadFiles/';
const api_cmd_log = '../log/api_cmd_log.out';
const local_ls_log = '../log/local_pinls.out';
const FSjson = '../../src/contracts/FACSync.json';
// const uploadFolder = './large_file/';
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
// 5
// const FSaddr = '0xe9911422941c4474c49f963e0dd9aad63f288c03';
// 15
const FSaddr = '0x8904ce9c435543faba4474e03d40f368af4fef38';
const FSinstance = new web3.eth.Contract(FSabi, FSaddr);


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
            console.log('------running comp.py-----');
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
        console.log(unpin_list);
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
        // console.log("start func get_state ...");
        state = await FSinstance.methods.getStat().call();
        // console.log("start func get_state finish!");
    } catch (e) {
        console.log("get_state: %o", e);
        return e;
    }

    return state;
}

async function get_flag(): Promise<any> {
    // web3.eth.defaultAccount = body.account;
    console.log(web3.eth.defaultAccount);
    //get exe flag(mode 1)
    const flag = await FSinstance.methods.getFlag().send({ from: web3.eth.defaultAccount });
    if (flag.events.Log_file.returnValues.succeed_or_not === false) {
        console.log("failed to set flag in function");
        console.log(flag.events.Log_file.returnValues);
        return flag.events.Log_file.returnValues;
    } else {
        return flag.events.Log_file.returnValues.succeed_or_not;
    }
}



function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let flag;
async function async_getflag() {
    flag = await get_flag();
}

let state;
async function async_getstate() {
    state = await get_state();
    console.log("state: %o", state);
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

/*exp*/
async function check_node_update(): Promise<any> {
    try {
        const state = await FSinstance.methods.check_all_update().call();
        return state;
    } catch (e) {
        console.log("check_node_update: %o", e);
        return e;
    }
}

let update = undefined;
async function async_check_node_update() {
    update = await check_node_update();
}

(async () => {
    //check if [0] aren't 0
    const accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];
    console.log(web3.eth.defaultAccount);
    await async_getstate();
    if ((state.exe != web3.eth.defaultAccount && state.exe != 0x0000000000000000000000000000000000000000))
        console.log("executor are occupied by %s.", state.exe);
    else {
        let startpt_exp12 = new Date()
        console.log("~~~~~~~~ startpt_exp12 %o ~~~~~~~~~~~~~", startpt_exp12);

        if (state.exe == 0x0000000000000000000000000000000000000000) {
            console.log("try get flag-----------");
            await async_getflag();
        }
        else {
            console.log("already get flag-----------");
            flag = true;
        }
        //only when try get flag haven't done will in while    
        while (flag == undefined || flag == null) {
            console.log("sleep 1sec");
            await delay(1000);
            console.log("delay get flag ...");
            //await async_getflag();
        }

        // console.log("[flag]succeed_or_not");
        // console.log(flag);

        if (flag == true) {
            console.log("------------obtain flag!------------");
            let roundth = 0, round = ((files.length) / 20) >> 0;
            if (files.length % 20 > 0)
                round += 1;
            let apifcnt;


            let startpt_exp7 = new Date()
            console.log("~~~~~~~~ startpt_exp7 %o ~~~~~~~~~~~~~", startpt_exp7);
            // ---write log file to smart contract(20at a time)----
            while (round--) {
                if (round != 0)
                    ub = 20;
                else {
                    if (files.length % 20 == 0)
                        ub = 20;
                    else
                        ub = files.length % 20;
                }

                var ub, js_uploadbase = { "0": ub };
                // convert image to base64 encoded string
                for (var i = roundth * 20, j = 0; i < (roundth + 1) * 20 && i < files.length, j < ub; i++ , j++) {
                    const base64str = base64_encode(uploadFolder + files[i]);
                    js_uploadbase[j + 1] = base64str;
                }


                /*
               var jsonstr = JSON.stringify(js_uploadbase);
               fs.writeFile(json_info, jsonstr, 'utf-8', function(err) {
                   if (err) throw (err);});
               */

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
                // console.log(cmd);
                // console.log(filehash);
                // console.log(apifcnt);

                var js_sclogfile = {
                    "sender": web3.eth.defaultAccount,
                    "apiamount": apifcnt,
                    "fileamount": ub,
                    "cmd": cmd,
                    "filename": filehash
                };

                console.log(js_sclogfile);

                await axios.post('http://140.113.216.99:3000/ipfs/event/trigger/sc/IL/keepLog', js_sclogfile)
                    .then((res) => {
                        // console.log(res.data);
                    })
                    .catch((error) => { console.error(error) });
                roundth++;
            }

            let endpt_exp7 = new Date()
            console.log("~~~~~~~~ endpt_exp7 %o ~~~~~~~~~~~~~", endpt_exp7);
            console.log("~~~~~~~~ exp7(u)    %o ~~~~~~~~~~~~~", +endpt_exp7 - +startpt_exp7);

            let filecorrect = false;
            while (filecorrect == false) {

                // run sgx to get pin ls (try to do it here)
                const exec = require('child_process').exec;
                const procChild = new Promise<any>((resolve, reject) => {
                    // const yourscript = exec('cd ../sgx/ && ./runner app.sgxs > ../uploadts_test/sgx_out.json', async (error, stdout, stderr) => {
                    const yourscript = exec('cd ../../src/sgx/ && ./runner app.sgxs', async (error, stdout, stderr) => {
                        console.log('------running in sgx-----');
                        if (error !== null) {
                            console.log(`exec error: ${error}`);
                            reject(error);
                        }
                        resolve(`${stdout}`);
                    });
                });

                let tmpResult = JSON.parse(await procChild);
                // console.log(tmpResult);
                // check file amount

                const sig_m = ethers.utils.splitSignature(tmpResult.sig);
                const sig_f = ethers.utils.splitSignature(tmpResult.sig_cnt);

                let startpt_exp5 = new Date()
                console.log("~~~~~~~~ startpt_exp5 %o ~~~~~~~~~~~~~", startpt_exp5);
                await async_setFAC(tmpResult.msg, sig_m, tmpResult.cnt, sig_f);
                let endpt_exp5 = new Date()
                console.log("~~~~~~~~ endpt_exp5 %o ~~~~~~~~~~~~~", endpt_exp5);
                console.log("~~~~~~~~ exp5(u) %o ~~~~~~~~~~~~~", +endpt_exp5 - +startpt_exp5);

                if (set_done.events.Log_file.returnValues.succeed_or_not == true) {

                    let endpt_exp1 = new Date()
                    console.log("~~~~~~~~ endpt_exp1 %o ~~~~~~~~~~~~~", endpt_exp1);
                    console.log("~~~~~~~~ exp1 %o ~~~~~~~~~~~~~", +endpt_exp1 - +startpt_exp12);
                    console.log("SET_SUCCEED");
                    filecorrect = true;
                    while (1) {
                        await async_check_node_update();
                        if (update == true)
                            break;
                    }

                    let endpt_exp2 = new Date()
                    console.log("~~~~~~~~ endpt_exp2 %o ~~~~~~~~~~~~~", endpt_exp2);
                    console.log("~~~~~~~~ exp2 %o ~~~~~~~~~~~~~", +endpt_exp2 - +startpt_exp12);
                    console.log("~~~~~~~~ exp6(u) %o ~~~~~~~~~~~~~", +endpt_exp2 - +endpt_exp1);
                    break;
                }
                else {
                    if (set_done.events.Log_file.returnValues.memo === "FCNT_NOTMATCH") {
                        console.log(set_done.events.Log_file.returnValues.memo);
                        console.log(set_done.events.File.returnValues)

                        let startpt_exp8 = new Date()
                        console.log("~~~~~~~~ startpt_exp8 %o ~~~~~~~~~~~~~", startpt_exp8);
                        if (await async_self_healing()) {
                            await axios.post('http://140.113.216.99:3000/ipfs/event/trigger/pinrm', unpin_list)
                                .then((res: any) => { })
                                .catch((error: any) => { console.error(error) });
                            let endpt_exp8 = new Date()
                            console.log("~~~~~~~~ endpt_exp8 %o ~~~~~~~~~~~~~", endpt_exp8);
                            console.log("~~~~~~~~ exp8(d) %o ~~~~~~~~~~~~~", +endpt_exp8 - +startpt_exp8);

                            // wait for all file unpin 
                            await delay(1500);
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

        }
        else {
            console.log("failed to get flag, please check log file or try later!");
        }

    }


    //await async_getstate();

    console.log("end");

})();


