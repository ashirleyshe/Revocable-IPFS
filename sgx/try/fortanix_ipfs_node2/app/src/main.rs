extern crate sha2;
extern crate ring;
extern crate chrono;
extern crate secp256k1;
extern crate rand;
extern crate sha3;

use std::str;
use std::io::{BufRead, BufReader};
use std::net::TcpStream;
use std::time::{SystemTime, UNIX_EPOCH};
use secp256k1::{Message, Secp256k1, Signature, recovery};
use secp256k1::key::{SecretKey, PublicKey};
use sha3::{Digest, Keccak256};
// use sha2::{Sha256, Digest};
// use rand::rngs::OsRng;

macro_rules! hex {
    ($hex:expr) => {
        {
            let mut vec = Vec::new();
            let mut b = 0;
            for (idx, c) in $hex.as_bytes().iter().enumerate() {
                b <<= 4;
                match *c {
                    b'A'..=b'F' => b |= c - b'A' + 10,
                    b'a'..=b'f' => b |= c - b'a' + 10,
                    b'0'..=b'9' => b |= c - b'0',
                    _ => panic!("Bad hex"),
                }
                if (idx & 1) == 1 {
                    vec.push(b);
                    b = 0;
                }
            }
            vec
        }
    }
}

fn get_time() -> String {
    let cur_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards");
    let time = format!("{:?}",cur_time)[0..10].to_string();
    time
}

fn prefix(data: &[u8]) -> String {
    format!("\x19Ethereum Signed Message:\x0a{}", data.len())
}

fn main() -> std::io::Result<()> {

    let peerId = "QmQJDBhu3ZMWmLS6KGXFofUKoKHH8vddH9jMxSbsmLCHUB";
    let ver_hash = "6e462f05b11971b3f43bc1cef8c054defb602fd3e7961780331733f7c0044078";
    
    let mut check = false;
    let stream_code = BufReader::new(TcpStream::connect("check-ipfscode")?);
    let buf_code = BufReader::new(stream_code);

    let mut str_code = String::new();
    for (_index, line) in buf_code.lines().enumerate() {
        str_code = line.unwrap();
        // println!("{:?}", str_code);
        break;
    }

    /*get peerid hash*/
    let mut keccak_code = Keccak256::default();
    keccak_code.input(peerId.as_bytes());
    let h_pid = keccak_code.result();
    // println!(">> h_pid  {:x}", h_pid);
    
    /*get ipfs code hash*/
    keccak_code = Keccak256::default();
    keccak_code.input(str_code.as_bytes());
    let h_code = keccak_code.result();
    // println!(">> h_code {:x}", h_code);
    
    /*get concat hash*/
    let code_msg = format!("{:x}{:x}", h_pid, h_code);
    // println!(">> code_msg {:?}", code_msg);
    keccak_code = Keccak256::default();
    keccak_code.input(code_msg.as_bytes());
    let h_codemsg = keccak_code.result();
    let str_h_codemsg = format!("{:x}", h_codemsg);
    
    // println!(">> h_codemsg {:}", str_h_codemsg);
    // println!(">> ver_hash {:}", ver_hash);
    


    if ver_hash == str_h_codemsg{
        check = true;
         /* call `ipfs repo gc` and `ipfs pin ls` */
        let stream_unpin = BufReader::new(TcpStream::connect("ipfs-unpin")?);
        let stream_d = BufReader::new(TcpStream::connect("ipfs-ls")?);
        let buf_d = BufReader::new(stream_d);
    
        // get pin ls vector
        let mut concat_ls = Vec::<String>::new();
        let mut ls_cnt = 0;
        for (_index, line) in buf_d.lines().enumerate() {
            ls_cnt+=1;
            let line = line.unwrap();
            concat_ls.push(line.to_string());
        }

        // sort the pin list (cuz the sequence is different everytime)
        concat_ls.sort();
        let mut pls_str = String::new();
        for i in concat_ls.iter() {
            pls_str += i ;
        }
        // println!("[plsstr]\n{}", pls_str);
        
        /* Get FAC of all pin file */
        let mut keccak_f= Keccak256::default();
        keccak_f.input(pls_str.as_bytes());
        let fac = keccak_f.result();
        // println!(">> FAC {:x}", fac);

        /*Get timestamp*/
        let time = get_time();
        /*get timestamp and fac*/
        let msg = format!("{}:{:x}:", time, fac);
        // println!(">> pure msg {}", &msg);

        
        /*get prefix message digest (ls_count)*/
        let tmp = format!("{}", ls_cnt);
        let mut pf_cnt = prefix(tmp.as_bytes()).into_bytes();
        pf_cnt.extend_from_slice(tmp.as_bytes());

        let mut keccak_cnt= Keccak256::default();
        keccak_cnt.input(&pf_cnt);
        let cnt_digest = keccak_cnt.result();
        //println!(">> cnt_digest {:x}", cnt_digest);

        
        /*with funciton(same result as above)*/
        let mut pf_msg = prefix(msg.as_bytes()).into_bytes();
        pf_msg.extend_from_slice(msg.as_bytes());    
        //vec2string
        // println!(">> message {:?}", str::from_utf8(&pf_msg));

        /*get message(with prefix) digest */
        let mut keccak_dg= Keccak256::default();
        keccak_dg.input(&pf_msg);
        let msg_dg = keccak_dg.result();
        // println!(">> msg_dg {:x}", msg_dg);

        /* Digital signature: Secpk1 */
        let secp = Secp256k1::new();
        let sk = hex!("454f0712c0403ff070e7690f1f29076dc400472ec85c1dde2d04bf92ea898c58");
        let sk = SecretKey::from_slice(&sk[..]).unwrap();
        let pk = hex!("030c7cbbe0fd38c7092f875c616fc505926a517c409766f25fd26b2b57c0d0f4ac");
        let pk = PublicKey::from_slice(&pk[..]).unwrap();
        

        let message = Message::from_slice(&msg_dg).expect("32 bytes");
        let message_cnt = Message::from_slice(&cnt_digest).expect("32 bytes");

        let sig_r = secp.sign_recoverable(&message, &sk);
        let sig_r_cnt = secp.sign_recoverable(&message_cnt, &sk);
        //println!("> 65b_sig {:?}", &sig_r);

        // get sig and recovery id for FAC
        let (rec_id, sig_64) = sig_r.serialize_compact();
        let mut sig_arr = vec![0; 65];
        sig_arr[0..64].copy_from_slice(&sig_64[0..64]);
        sig_arr[64] = rec_id.to_i32() as u8;

        // get sig and recovery id for FAC
        let (rec_id_cnt, sig_64_cnt) = sig_r_cnt.serialize_compact();
        let mut sig_arr_cnt = vec![0; 65];
        sig_arr_cnt[0..64].copy_from_slice(&sig_64_cnt[0..64]);
        sig_arr_cnt[64] = rec_id_cnt.to_i32() as u8;

        // turn sig into correct format
        let mut sig_65 = String::new();
        sig_65 = format!("0x{}", sig_65);

        for x in sig_arr.iter() {
            let tmps = format!("{:x}", x);
            if tmps.chars().count()<2{
                sig_65 = format!("{}0{}", sig_65, tmps);} 
            else{
                sig_65 = format!("{}{}", sig_65, tmps);}
            // print!("{:x} ", x);
        }
        // println!("{}", sig_65);
        // println!(">> pure msg {}", &msg);
        
        let mut sig_65_cnt = String::new();
        sig_65_cnt = format!("0x{}", sig_65_cnt);

        for y in sig_arr_cnt.iter() {
            let tmps = format!("{:x}", y);
            if tmps.chars().count()<2{
                sig_65_cnt = format!("{}0{}", sig_65_cnt, tmps);} 
            else{
                sig_65_cnt = format!("{}{}", sig_65_cnt, tmps);}
            // print!("{:x} ", x);
        }

        /*command for doing exp(normal we need it)*/
        println!("{{\"peerID\": \"{}\", \"check\": \"{}\", \"msg\": \"{}\", \"sig\": \"{}\", \"cnt\": \"{}\", \"sig_cnt\": \"{}\" }}", peerId, check, &msg, sig_65, ls_cnt,sig_65_cnt);
        
        // println!(">> verify {:?}", secp.recover(&message, &sig_r));
        // println!("end app");

        Ok(())


    }else{
        check = false;
        /*command for doing exp(normal we need it)*/
        println!("{{ \"check\": \"{}\"}}", check);
        // println!("!!!!!!!!Compromise!!!!!!!");
        Ok(())
    } 
 

    
}
