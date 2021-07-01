
#!/bin/bash
set -e

master(){
    echo master
    geth --mine --identity "master" --syncmode "full" --networkid 1504 --port "30320" --rpc --rpcport "8545" --datadir "./data" --rpccorsdomain "*" --nat "any" --rpcapi eth,web3,personal,net --ipcpath "~/.ethereum/geth.ipc" --unlock b51FA99C248D426ff86fd60aE71834F662311913 --allow-insecure-unlock --nodiscover console
}


node1(){
    echo node1
    geth --mine --identity "node1" --syncmode "full" --networkid 1504  --datadir "./data" --rpc --rpcport "8546" --port "30321" --rpccorsdomain "*" --nat "any" --rpcapi eth,web3,personal,net --ipcpath "~/.ethereum/geth.ipc"  --unlock 204ae41b745CeE8301fcaEC7Add626718735CCd2 --allow-insecure-unlock --nodiscover console
}

node2(){
    echo node2
    geth --mine --identity "node2" --syncmode "full" --networkid 1504  --datadir "./data" --rpc --rpcport "8547" --port "30322" --rpccorsdomain "*" --nat "any" --rpcapi eth,web3,personal,net --ipcpath "~/.ethereum/geth.ipc"  --unlock BC6596a9A1584e21d94DC65F606078dE8857db20  --allow-insecure-unlock --nodiscover console
}

usage() {
    cat 1>&2 <<EOF
The script is for setting up ipfs and ipfs cluster enviornment.
USAGE:
    bash setIPFS.sh [FLAGS] [OPTIONS]
FLAGS:
    --master                If you are master node (signer)
    --node1                 If you are node1
    --node2                 If you are node2
EOF
}

case "$1" in
  --master) shift; master $@ ;;
  --node1) shift; node1 $@ ;;
  --node2) shift; node2 $@ ;;
  -h|--help)
      usage
      exit 0
      ;;
  *) usage
     exit 0
     ;;
esac