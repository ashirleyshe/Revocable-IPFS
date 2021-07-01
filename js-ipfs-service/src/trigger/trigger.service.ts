import { Injectable, Body, HttpStatus } from '@nestjs/common';
import express = require('express');
import fs = require('fs');
import ipfsClient = require('ipfs-http-client');
import ipfsClusterAPI = require('ipfs-cluster-api');
import * as jwt from 'jsonwebtoken';
import ethers = require('ethers');
import { resolve } from 'url';

const keccak256 = require('keccak256');
const eu = require('ethereumjs-util');
const app = express();
const ipfs = ipfsClient('localhost', '5001', { protocol: 'http' });
const ipfsCluster = ipfsClusterAPI('localhost', 9094, { protocol: 'http' });

/* For smart contract use */
const Web3 = require('web3');
const ethereumUri = 'http://localhost:8545';
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(ethereumUri));
/* contract info */


// 5
const FScontract = JSON.parse(fs.readFileSync('./src/trigger/contracts5/FACSync.json', 'utf8'));
const FSaddr = '0x2f980fc088cec646503b6457dd6838b3f2cfba3e';
// 15
// const FScontract = JSON.parse(fs.readFileSync('./src/trigger/contracts/FACSync.json', 'utf8'));
// const FSaddr = '0x8904ce9c435543faba4474e03d40f368af4fef38';
const FSabi = FScontract.abi;
const FSinstance = new web3.eth.Contract(FSabi, FSaddr);
// 5
const ILcontract = JSON.parse(fs.readFileSync('./src/trigger/contracts5/IPFSlog.json', 'utf8'));
const ILaddr = '0x39483795c1a8cb500dff62d7acea31b158d799bf';
// 15
// const ILcontract = JSON.parse(fs.readFileSync('./src/trigger/contracts/IPFSlog.json', 'utf8'));
// const ILaddr = '0x2b9141088eefa99d34730c19ae8a10e4df5e139d';
const ILabi = ILcontract.abi;
const ILinstance = new web3.eth.Contract(ILabi, ILaddr);
let countFile = 0;
// tslint:disable-next-line: max-line-length
let ipfs_account = ['Qmet6o1ojPFZaeifa7tFzkXryvUhrfLsnpJq2NHPBkk1Wu', 'QmekfAbbP8WYv9AVrEt3N1GWSTj5SnXXcVCbCmsPnraMcw', 'QmQJDBhu3ZMWmLS6KGXFofUKoKHH8vddH9jMxSbsmLCHUB'];
let valsign_addr = ['0xab0e7fb70df014cf5520287ee1497817243b01a9', '0x30776dc632f936c99ee1becb977c1733c7924a6f', '0xba092eb468bdb5a91147cd924211883f10be251b'];

(async () => {
    const accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];
    countFile = await ILinstance.methods.get_api_cnt().call();
    console.log('countFile init: %o', countFile);
})();

@Injectable()
export class TriggerService {
    jwtFile = './src/config/jwt.json';

    public async ipfs_add(binaryfile: any, filehash: string): Promise<any> {
        const promise = new Promise<any>(resolve => {
            ipfs.add(Buffer.from(binaryfile, 'base64'), async (err, file) => {
                let hashcode = '';
                if (err) {
                    console.log(err);
                    return HttpStatus.NOT_FOUND;
                } else {
                    hashcode = file[0].hash;
                    /*
                    ipfs.cat(hashcode, (err, file) => {
                        if (err) {
                            throw err;
                        }
                        console.log('>> [INFO] ' + file.toString());
                    });
                    */
                    ipfsCluster.pin.add(hashcode, {}, () => {
                        // console.log('>> [DONE] adding and pinning the file into ipfs-cluster');
                        console.log('>> [UPLOAD] IPFS hash: ' + hashcode);
                    });
                }
                resolve(hashcode);
            });
        });
        filehash += await promise + ':';
        return filehash;
    }

    public async upload_to_ipfs(body: any): Promise<any> {
        countFile = await ILinstance.methods.get_api_cnt().call();
        console.log('countFile in  pin: %o', countFile);
        let cmd = '';
        let filehash = '';
        // tslint:disable-next-line: no-bitwise
        let T = (body[0] / 20 >> 0) + 1;
        let inloop = 0;
        while (T) {
            let ub = 0;
            if (T === 1) {
                ub = body[0] % 20;
            } else {
                ub = 20;
            }
            for (let i = inloop * 20 + 1; i < inloop * 20 + ub + 1; i++) {
                countFile++;
                cmd += 'pin:';
                filehash = await this.ipfs_add(body[i], filehash);
            }
            T--;
            inloop++;
        }

        // console.log(filehash);
        return { cmd, filehash, countFile };
    }

    public async ipfs_rm(body: any, countfile: any): Promise<any> {
        const promise = new Promise<any>(resolve => {
            let cnt = countfile;

            ipfsCluster.pin.rm(body, async (err, reject) => {
                if (err) {
                    console.log(err);
                    console.log('[ERROR] unpin file %s not found', body);
                } else {
                    cnt--;
                    console.log('>> [DELETE] unpin file succeed');
                    console.log('countFile after unpin: %o', countFile);
                }
                resolve(cnt);
            });
        });
        return await promise;
    }

    public async unpin_from_ipfs(body: any): Promise<any> {
        countFile = await ILinstance.methods.get_api_cnt().call();
        console.log('countFile in unpin: %o', countFile);
        if (body.mode === 'recover') {
            console.log('recover');
            for (let i = 1; i <= body[0]; i++) {
                countFile = Number(await this.ipfs_rm(body[i], countFile));
                console.log('in api unpin recover %o', countFile);
            }
            return 0;

        } else if (body.mode === 'normal_unpin') {
            console.log('normal_unpin');
            let cmd = '';
            let filehash = '';
            // 20 at a time (gas limit to write sc)
            // tslint:disable-next-line: no-bitwise
            let T = (body[0] / 20 >> 0) + 1;
            let inloop = 0;
            while (T) {
                let ub = 0;
                if (T === 1) {
                    ub = body[0] % 20;
                } else {
                    ub = 20;
                }
                for (let i = inloop * 20 + 1; i < inloop * 20 + ub + 1; i++) {
                    countFile = Number(await this.ipfs_rm(body[i], countFile));
                    console.log('in api unpin normal %o', countFile);
                    cmd += 'unpin:';
                    filehash += (body[i] + ':');
                }
                T--;
                inloop++;
            }
            return { cmd, filehash, countFile };
        }
        return 0;
    }

    // spilt signature from sgx
    public async get_RSV(body: any): Promise<any> {
        const sig = await ethers.utils.splitSignature(body.signature);
        const sig_msg: any = {};
        sig_msg.message = body.message;
        sig_msg.r = sig.r;
        sig_msg.s = sig.s;
        sig_msg.v = sig.v;
        return sig_msg;
    }

    // [sc] get state to check
    public async get_state(body: any): Promise<any> {
        const state = await FSinstance.methods.getStat().call();
        return state;
    }

    // authorized to get flag to make changes(both add and delete)
    public async get_flag(body: any): Promise<any> {
        // web3.eth.defaultAccount = body.account;

        const flag = await FSinstance.methods.getFlag(body.mode).send({ from: web3.eth.defaultAccount });
        if (flag.events.Log_file.returnValues.succeed_or_not === false) {
            return flag.events.Log_file.returnValues;
        } else {
            return flag.events.Log_file.returnValues.succeed_or_not;
        }
    }

    // [sc] get state to check
    public async set_fac(body: any): Promise<any> {
        const tmp = await FSinstance.methods.setFAC(body.message, body.v, body.r, body.s).send({ from: web3.eth.defaultAccount });
        return tmp.events.Log_file.returnValues;
    }

    // IPFSlog sc keep ipfs cmd log
    public async keep_log(body: any): Promise<any> {

        const msgHash = keccak256('\x19Ethereum Signed Message:\n' + body.msg.length + body.msg);
        // tslint:disable-next-line: variable-name
        const sig_m = ethers.utils.splitSignature(body.sig);
        const pub = eu.ecrecover(msgHash, sig_m.v, sig_m.r, sig_m.s);
        const addr = '0x' + eu.pubToAddress(pub).toString('hex');

        if (addr === valsign_addr[ipfs_account.indexOf(body.peerID)]) {
            // tslint:disable-next-line: max-line-length
            const flag = await ILinstance.methods.keeplog(body.sender, body.apiamount, body.fileamount, body.cmd, body.filename).send({ from: web3.eth.defaultAccount });
            return flag.events.API_fileAmt.returnValues;
            // return "Signature verification passed!";
        } else {
            return 'Signature verification falied!';
        }
    }

    // IPFSlog sc get ipfs cmd log
    public async get_all_logs(body: any): Promise<any> {

        // tslint:disable-next-line: max-line-length
        const all_event = await ILinstance.getPastEvents('Cmdlog', {}, { fromBlock: 21728, toBlock: 'latest' }
            , function (error, events) {/*console.log(error);*/ })
            .then(function (events) { return events; });
        return all_event;
    }

    /*
    public async delete_from_ipfs(body: any): Promise<object> {
        // unpin filefrom ipfs
        let tmpResult: any;
        const procRm = await new Promise<any>((resolve, reject) => {
            ipfsCluster.pin.rm(body.file, async (err) => {
                if (err) {
                    console.log(err);
                    console.log('[ERROR] unpin file not found');
                    reject(err);
                }

                console.log('>> [DONE] unpin file succeed');
                // clean local upin file
                const exec = require('child_process').exec;

                const procChild = new Promise<any>((resolve, reject) => {
                    const yourscript = exec('ipfs repo gc', async (error, stdout, stderr) => {
                        // console.log(`${stdout}`);
                        // console.log(`${stderr}`);
                        console.log('>> [WARN] Please remind other nodes to delete the file or it will still be able to cat and keep the files');
                        if (error !== null) {
                            console.log(`exec error: ${error}`);
                            reject(error);
                        }
                        console.log('>> [DONE] cleanning local unpin file succeed');
                        const judge = await this.get_nodeFAC();
                        // console.log(judge.FAC);
                        // console.log(judge.token);
                        // return judge-->procChild
                        resolve(judge);
                    });
                });
                tmpResult = await procChild;
                // return tmpResult-->procRm
                resolve(tmpResult);
            });
        });
        this.update_config('ipfs_info', JSON.stringify(procRm.token));
        return procRm;
    }
    */
    /*
     public async get_nodeFAC(): Promise<any> {
         let FAC = '';
         let token = '';
         try {
             const pinset = await ipfs.pin.ls();
 
             let cipfsHashes = '';
 
             for (const value of pinset) {
                 cipfsHashes = cipfsHashes.concat(value.hash);
             }
 
             try {
                 const file  = await ipfs.add( Buffer.from(cipfsHashes), {onlyHash: true});
 
                 FAC = file[0].hash;
                 console.log('>> [INFO] FAC: ' + FAC);
                 const timestamp = await this.get_time();
                 console.log('>> [INFO] Timestamp: ' + timestamp);
                 token = await this.createToken(timestamp);
                 return {FAC, token};
 
             } catch (err) {
                 console.log('ipfs.add Error: %o', err);
             }
         } catch (err) {
             console.log('ipfs.pin.ls Error: %o', err);
         }
         return 'UNDONE';
 
     }
     */
    /*
     public async get_time(): Promise <string> {
         const today = await new Date();
         const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
         const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds() + ':' + today.getMilliseconds();
         return date + ' ' + time;
     }
 */
    /*
        public async createToken(timestamp: string) {
            // console.log(timestamp);
            const expiresTime = '10m';
            const token = await jwt.sign({timestamp}, this.get_jwtsecret(), {algorithm: 'HS256', expiresIn: expiresTime});
            // console.log(token);
            return token;
        }
        */
    /*
        private get_jwtsecret() {
            const secret = 'hihibyebye87';
            return secret;
        }
    */
    /*
        public async update_config(variable: string, value: string) {
            let data: Buffer;
            try {
                data = fs.readFileSync(this.jwtFile);
            } catch (err) {
                console.log('readFileSync Error: ');
                console.log(err);
            }
    
            const obj = JSON.parse(data.toString('utf8'));
            obj[variable] = value;
            const json = JSON.stringify(obj);
    
            try {
                // console.log(json)
                fs.writeFileSync(this.jwtFile, json, 'utf8');
            } catch (err) {
                console.log('writeFileSync Error: ');
                console.log(err);
            }
        }
    */
    /*
    public async get_jwt(): Promise<any> {
        return await this.readConfigfile();
    }

    public async readConfigfile() {
        // this.Config = require(this.configpath);  //會有非同步情況，檔案未寫入
        const dConfig = JSON.parse(fs.readFileSync(this.jwtFile, 'utf8'));
        return dConfig;
    }
*/

}
