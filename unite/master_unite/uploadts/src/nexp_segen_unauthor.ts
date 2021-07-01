const uploadFolder = '../baduploadFiles/';
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
import { connect } from 'net';
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

    // const execgen = require('child_process').exec;
    // const procChildgen = new Promise<any>((resolve, reject) => {
    //     // const yourscript = exec('cd ../sgx/ && ./runner app.sgxs > ../uploadts_test/sgx_out.json', async (error, stdout, stderr) => {
    //     const yourscript = execgen('cd ../ && ./badgenfile.sh', async (error, stdout, stderr) => {
    //         // console.log('genfile');
    //         if (error !== null) {
    //             console.log(`exec error: ${error}`);
    //             reject(error);
    //         }
    //         resolve(`${stdout}`);
    //     });
    // });
    // await procChildgen;

    // while (procChildgen != undefined) {
    let roundth = 0, round = ((files.length) / 20) >> 0;
    if (files.length % 20 > 0)
        round += 1;

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

        var ub, js_uploadbase = { "0": ub };
        // convert image to base64 encoded string
        for (var i = roundth * 20, j = 0; i < (roundth + 1) * 20 && i < files.length, j < ub; i++ , j++) {

            const base64str = base64_encode(uploadFolder + files[i]);
            js_uploadbase[j + 1] = base64str;
        }
        console.log(js_uploadbase);


        //post file to api
        let cmd, filehash;

        await axios.post('http://140.113.216.99:3000/ipfs/event/trigger/pinadd', js_uploadbase)
            .then((res) => {
                cmd = res.data.cmd;
                filehash = res.data.filehash;
            })
            .catch((error) => {
                console.error(error)
            });
        return;

    }

    //}

    console.log("end");

})();



