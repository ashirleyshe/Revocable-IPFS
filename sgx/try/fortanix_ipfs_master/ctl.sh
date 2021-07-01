set -e


exp(){
    need_cmd ipfs
    need_cmd sha512sum 
    need_cmd ftxsgx-elf2sgxs

    echo -n "How many round?"
    read t
    i=1
    need_cmd ipfs 
    need_cmd ftxsgx-elf2sgxs
    cd runner
    cargo +nightly build --target=x86_64-unknown-linux-gnu
    cd -
    cd app
    cargo +nightly build --target=x86_64-fortanix-unknown-sgx
    cd -
    ftxsgx-elf2sgxs app/target/x86_64-fortanix-unknown-sgx/debug/app --heap-size 0x100000 --stack-size 0x100000 --threads 1 --debug 
    SUMTIME=0
    j=1
    r=10

    while [ $j -le $r ]
    do 
        (( j++ ))
        ST=$(($(date +%s%N)/1000000))
        while [ $i -le $t ]
        do
            runner/target/x86_64-unknown-linux-gnu/debug/runner app/target/x86_64-fortanix-unknown-sgx/debug/app.sgxs
            (( i++ ))
        done
        ET=$(($(date +%s%N)/1000000))
        ELAPSED_TIME=$(($ET - $ST))
        #echo $ELAPSED_TIME
        SUMTIME=$(($ELAPSED_TIME + $SUMTIME))
        i=1
    done
    echo $((SUMTIME / r))


}



test(){
    # Commands that will be used
    need_cmd ipfs
    need_cmd sha512sum 
    need_cmd ftxsgx-elf2sgxs

    # Build custom runner
    cd runner
    cargo +nightly build --target=x86_64-unknown-linux-gnu
    
    cd -

    # Build APP
    cd app
    cargo +nightly build --target=x86_64-fortanix-unknown-sgx
    cd -

    # Convert the APP
    # if encounter " trigger the ERROR:  Enclave panicked: memory allocation of 590032 bytes failed " raise the heapsize and stacksize (from 0x20000)
    ftxsgx-elf2sgxs app/target/x86_64-fortanix-unknown-sgx/debug/app --heap-size 0x100000 --stack-size 0x100000 --threads 1 --debug  
    
    # Execute
    runner/target/x86_64-unknown-linux-gnu/debug/runner app/target/x86_64-fortanix-unknown-sgx/debug/app.sgxs

}

deploy_test(){
    need_cmd ipfs
    need_cmd sha512sum 
    need_cmd ftxsgx-elf2sgxs
    echo "Deploy runner and app.sgxs to tmp directory for test"
    test
    # cp -f runner/target/x86_64-unknown-linux-gnu/debug/runner /tmp/
    # cp -f app/target/x86_64-fortanix-unknown-sgx/debug/app.sgxs /tmp/
    # pushd /tmp
    cp -f runner/target/x86_64-unknown-linux-gnu/debug/runner /home/breakfast/Mon-IPFS/unite/master_unite/src/sgx/
    cp -f app/target/x86_64-fortanix-unknown-sgx/debug/app.sgxs /home/breakfast/Mon-IPFS/unite/master_unite/src/sgx/
    pushd /home/breakfast/Mon-IPFS/unite/master_unite/src/sgx/
    ./runner app.sgxs
    # echo "Clean runner and app.sgxs"
    # rm runner app.sgxs
    popd
}


need_cmd() {
    # "$1" stands for the first arg followed by need_cm
    if ! check_cmd "$1"; then
        err "need '$1' (command not found)"
    fi
}

check_cmd() {
    command -v "$1" > /dev/null 2>&1
}

err() {
    say "$1" >&2
    exit 1
}

say() {
    printf "ERROR: %s\n" "$1"
}


usage() {
    cat 1>&2 <<EOF
The script for running fortanix-ipfs
USAGE:
    bash ctl.sh [FLAGS] [OPTIONS]
FLAGS:
    --test
    --deploy_test
    --exp 
    -v, --version           Prints version information
EOF
}

case "$1" in
  --test) shift; test $@ ;;
  --exp) shift; exp $@ ;;
  --deploy_test) shift; deploy_test $@ ;;
  -h|--help)
      usage
      exit 0
      ;;
  *) usage
     exit 0
     ;;
esac
