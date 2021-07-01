#!/bin/bash
set -e


test() {
    delete
}



delete(){
    
    # Execute sgx-fortanix-ipfs
    cd /home/breakfast/Mon-IPFS/unite/sgx
    ./runner app.sgxs > ../sgx.output
    cd ..

    # Get signature
    # echo `cat sgx.output`
    msg=`cat sgx.output | jq -r '.msg'`
    sig=`cat sgx.output | jq -r '.sig'`
    

    # call js to spilt signature2 r s v
curl -X POST \
  'http://140.113.216.99:3000/ipfs/event/trigger/rsv?=' \
  -H 'Accept: */*' \
  -H 'Accept-Encoding: gzip, deflate' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Host: localhost:3000' \
  -H 'User-Agent: PostmanRuntime/7.19.0' \
  -d '{
	"signature": "'${sig}'",
	"message" : "'${msg}'"
}
' --silent >update_info.json

    # echo `cat update_info.json`
    r=`cat update_info.json | jq '.r'`
    s=`cat update_info.json | jq '.s'` 
    v=`cat update_info.json | jq -r '.v'`
    # echo "$r"
    # echo "$s"
    # echo "$v"
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
The script for running unite Mon-ipfs
USAGE:
    bash unite.sh [FLAGS] [OPTIONS]
FLAGS:
    --delete
    -v, --version           Prints version information
EOF
}

case "$1" in
  --delete) shift; delete $@ ;;
  --test) shift; test $@ ;;
  -h|--help)
      usage
      exit 0
      ;;
  *) usage
     exit 0
     ;;
esac
