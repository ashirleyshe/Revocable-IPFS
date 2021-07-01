# Rust lang 

For command:

[Struct std::process::Command](https://doc.rust-lang.org/std/process/struct.Command.html)

> Commands i may use:
```
// delete unpin files
ipfs repo gc 
// get all ipfs pin list
ipfs pin ls  
// after concat all values calculate the hash (FAC)
ipfs add <path> -n (only hash) 
```
> log 2019.10.15 done ipfs repo gc
```
breakfast@ubuntu-master:~/Mon-IPFS/sgx/try/fortanix_ipfs$ ipfs-cluster-ctl pin rm Qmbs4ULc9UkvYajkiy5tZhSmrSJ7XPdYD2fjXQ4oN4XGkN
Qmbs4ULc9UkvYajkiy5tZhSmrSJ7XPdYD2fjXQ4oN4XGkN :
    > ubuntu-n2       : UNPINNED | 2019-10-15T23:53:00.840455306+08:00
    > ubuntu-n1       : UNPINNED | 2019-10-15T23:53:00.861235069+08:00
    > ubuntu-master   : UNPINNED | 2019-10-15T23:53:00.865081062+08:00
breakfast@ubuntu-master:~/Mon-IPFS/sgx/try/fortanix_ipfs$ ipfs pin lsbreakfast@ubuntu-master:~/Mon-IPFS/sgx/try/fortanix_ipfs$ ./ctl.sh --test    
    Finished dev [unoptimized + debuginfo] target(s) in 0.02s
/home/breakfast/Mon-IPFS/sgx/try/fortanix_ipfs
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
/home/breakfast/Mon-IPFS/sgx/try/fortanix_ipfs
start runner
start app
removed QmeRHBzpH6uW14M25yBxkPvBeTEpohfd1xDVtAEhQJ14yP
removed Qmc7rAWDQ8KyTcqz2Vnqrun5Ctba7H2eD2uK2MAgLL78RZ
removed Qmbs4ULc9UkvYajkiy5tZhSmrSJ7XPdYD2fjXQ4oN4XGkN
end app
end runner
breakfast@ubuntu-master:~/Mon-IPFS/sgx/try/fortanix_ipfs$ ipfs pin ls
```
