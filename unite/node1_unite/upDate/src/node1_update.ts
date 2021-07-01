const api_cmd_log = '../log/api_cmd_log.out';
const local_ls_log = '../log/local_pinls.out';
const FSjson = '../../src/contracts5/FACSync.json';
// const uploadFolder = './large_file/';
import fs = require('fs');

// const json_info = './json_info.json';
const axios = require('axios');
import ethers = require('ethers');

/*ipfs*/
import ipfsClient = require('ipfs-http-client');

const ipfs = ipfsClient('http://localhost:5001')
/* For smart contract use */
const Web3 = require('web3');
//remember change to current geth node [ip:port]
const ethereumUri = 'http://140.113.216.124:8546';
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(ethereumUri));

/* contract info */
const FScontract = JSON.parse(fs.readFileSync(FSjson, 'utf8'));
const FSabi = FScontract.abi;
// 5
const FSaddr = '0x2f980fc088cec646503b6457dd6838b3f2cfba3e';
// 15
// const FSaddr = '0x8904ce9c435543faba4474e03d40f368af4fef38';
const FSinstance = new web3.eth.Contract(FSabi, FSaddr);


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

async function renewFAC(msg: any, sigm: any, cnt: any, sigf: any): Promise<any> {
    let setFstate;
    try {
        setFstate = await FSinstance.methods.updateFAC(msg, sigm.v, sigm.r, sigm.s, cnt, sigf.v, sigf.r, sigf.s).send({ from: web3.eth.defaultAccount });
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

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function get_nodestatus(cur_time: Number): Promise<any> {
    try {
        const n_res = await FSinstance.methods.get_nodestatus(cur_time).call();
        return n_res;
    } catch (e) {
        console.log("get_nodestatus: %o", e);
        return e;
    }
}


let nstatus = undefined;
async function async_get_nodestatus(cur_time: Number) {
    nstatus = await get_nodestatus(cur_time);
}

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

let state;
async function async_getstate() {
    state = await get_state();
    console.log("state: %o", state);
}

let set_done;
async function async_renewFAC(msg: any, sigm: any, cnt: any, sigf: any) {
    set_done = await renewFAC(msg, sigm, cnt, sigf);
    // console.log("set_done: %o", set_done.events);
}

async function async_self_healing() {
    console.log("self healing process------")
    await async_get_api_cmd_log();
    await async_get_local_pinls();
    return await async_get_unpin_list();
}


(async () => {
    const accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];
    console.log(web3.eth.defaultAccount);
    let old_ts = Number(0);
    while (1) {

        while (1) {
            await async_getstate();
            // check timstamp and uploader address
            await async_check_node_update();

            console.log(update); //true all node updated false not update yet
            if (update == true)
                old_ts = Number(state.curts_index);
            else {
                await async_get_nodestatus(Number(state.curts_index));

                //await delay(111115000);  
                if (nstatus.iscorrect == 0) {
                    old_ts = Number(0);
                }
                else if (nstatus.iscorrect == 1 && state.current_exe == web3.eth.defaultAccount) {
                    old_ts = Number(state.curts_index);
                    console.log("changes are made by me, sleep 5 sec for others to update......");
                    await delay(5000);
                    break;
                }
                else {
                    console.log("others haven't complete update!");
                    break;
                }

            }

            if (Number(old_ts) < Number(state.curts_index)) {
                console.log("changes has been detected------");
                if (state.current_exe != web3.eth.defaultAccount) {
                    console.log("changes are made by others......");
                    console.log("------------start update!------------");
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
                        console.log(tmpResult);
                        // check file amount

                        const sig_m = ethers.utils.splitSignature(tmpResult.sig);
                        const sig_f = ethers.utils.splitSignature(tmpResult.sig_cnt);
                        //const wt = Math.random() * (500 - 0) + 0;
                        //await delay(wt); 
                        //console.log(wt); 
                        await async_renewFAC(tmpResult.msg, sig_m, tmpResult.cnt, sig_f);

                        if (set_done == undefined)
                            break;

                        console.log(set_done.events)


                        if (set_done.events.Log_file.returnValues.succeed_or_not == true) {
                            console.log("SET_SUCCEED");
                            filecorrect = true;
                            /*console.log("update succeed, sleep 10 sec for others to update......");
                            await delay(10000); 
                            */
                            break;
                        }
                        else {
                            if (set_done.events.Log_file.returnValues.memo === "FCNT_NOTMATCH") {
                                console.log(set_done.events.Log_file.returnValues.memo);
                                console.log(set_done.events.File.returnValues)

                                if (await async_self_healing()) {
                                    await axios.post('http://140.113.216.99:3000/ipfs/event/trigger/pinrm', unpin_list)
                                        .then((res: any) => { })
                                        .catch((error: any) => { console.error(error) });

                                    // wait for all file unpin 
                                    await delay(1500);

                                }
                                else
                                    console.log("false");
                                filecorrect = false;

                            }
                            else {
                                console.log(set_done.events.Log_file.returnValues.memo);
                                filecorrect = true;
                                break;
                            }
                        }
                    }
                    old_ts = Number(state.curts_index);
                }
                else {
                    console.log("changes are made by me, sleep 5 sec for others to update......");
                    await delay(5000);
                    continue;
                }
            }
            else {
                console.log("no changes being made check 0.1sec later........");
                await delay(100);
                continue;
            }

            break;
        }


    }




})();


