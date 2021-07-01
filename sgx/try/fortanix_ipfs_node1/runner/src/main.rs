/* Copyright (c) Fortanix, Inc.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

extern crate aesm_client;
extern crate enclave_runner;
extern crate sgxs_loaders;

use aesm_client::AesmClient;
use enclave_runner::usercalls::{SyncStream, UsercallExtension};
use enclave_runner::EnclaveBuilder;
use sgxs_loaders::isgx::Device as IsgxDevice;
use std::io::{Read, Result as IoResult, Write};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};

struct IpfsService {
    c: Arc<Mutex<Child>>,
}
// for exe `ipfs repo gc` command
impl IpfsService {
     fn ck_code() -> Result<IpfsService, std::io::Error> {
        Command::new("/usr/bin/sha512sum")
            .arg("/usr/local/bin/ipfs")
            .stdout(Stdio::piped())
            .stdin(Stdio::piped())
            .spawn()
            .map(|c| Arc::new(Mutex::new(c)))
            .map(|c| IpfsService { c })
    }

    fn rm_upfile() -> Result<IpfsService, std::io::Error> {
        Command::new("/usr/local/bin/ipfs")
            .arg("repo")
            .arg("gc")
            .stdout(Stdio::piped())
            .stdin(Stdio::piped())
            .spawn()
            .map(|c| Arc::new(Mutex::new(c)))
            .map(|c| IpfsService { c })
    }

    fn ls_pfile() -> Result<IpfsService, std::io::Error> {
        Command::new("/usr/local/bin/ipfs")
            .arg("pin")
            .arg("ls")
            .arg("-q")
            .stdout(Stdio::piped())
            .stdin(Stdio::piped())
            .spawn()
            .map(|c| Arc::new(Mutex::new(c)))
            .map(|c| IpfsService { c })
    }
    
}
 
//not quite understand the usage
impl SyncStream for IpfsService {
    fn read(&self, buf: &mut [u8]) -> IoResult<usize> {
        self.c.lock().unwrap().stdout.as_mut().unwrap().read(buf)
    }

    fn write(&self, buf: &[u8]) -> IoResult<usize> {
        self.c.lock().unwrap().stdin.as_mut().unwrap().write(buf)
    }

    fn flush(&self) -> IoResult<()> {
        self.c.lock().unwrap().stdin.as_mut().unwrap().flush()
    }
}

#[derive(Debug)]
struct ExternalService;
// Ignoring local_addr and peer_addr, as they are not relavent in the current context.
impl UsercallExtension for ExternalService {
    fn connect_stream(
        &self,
        addr: &str,
        _local_addr: Option<&mut String>,
        _peer_addr: Option<&mut String>,
    ) -> IoResult<Option<Box<dyn SyncStream>>> {
        // If the passed address is not "ipfs", we return none, whereby the passed address gets treated as
        // an IP address which is the default behavior.

        match &*addr {
            "check-ipfscode" => {
                let check = IpfsService::ck_code()?;
                Ok(Some(Box::new(check)))
            }
            "ipfs-unpin" => {
                let unpin = IpfsService::rm_upfile()?;
                Ok(Some(Box::new(unpin)))
            }
            "ipfs-ls" => {
                let pinls = IpfsService::ls_pfile()?;
                Ok(Some(Box::new(pinls)))
            }
            _ => Ok(None)
        }
    }
}

fn usage(name: String) {
    println!("Usage:\n{} <path_to_sgxs_file>", name);
}

fn parse_args() -> Result<String, ()> {
    let args: Vec<String> = std::env::args().collect();
    match args.len() {
        2 => Ok(args[1].to_owned()),
        _ => {
            usage(args[0].to_owned());
            Err(())
        }
    }
}

fn main() {
    // println!("start runner");
    let file = parse_args().unwrap();
    let mut device = IsgxDevice::new()
        .unwrap()
        .einittoken_provider(AesmClient::new())
        .build();
    
    let mut enclave_builder = EnclaveBuilder::new(file.as_ref());
    enclave_builder.dummy_signature();
    enclave_builder.usercall_extension(ExternalService);
    

    let enclave = enclave_builder.build(&mut device).unwrap();
    enclave
        .run()
        .map_err(|e| {
            println!("Error while executing SGX enclave.\n{}", e);
            std::process::exit(1)
        })
        .unwrap();
        
    // println!("end runner");
}
