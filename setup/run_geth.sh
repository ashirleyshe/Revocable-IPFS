
#!/bin/bash
set -e

master_15(){
    echo master_15
    cd /home/$USER/master
    geth --identity "master_15" --mine --targetgaslimit '42000000' --syncmode "full" --networkid 1504 --port "30320" --rpc --rpcaddr "0.0.0.0" --rpcport "8545" --datadir "./data" --rpccorsdomain "*" --nat "any" --rpcapi eth,web3,personal,net --ipcpath "~/.ethereum/geth.ipc" --unlock b51FA99C248D426ff86fd60aE71834F662311913 --allow-insecure-unlock --nodiscover console
}

master_5(){
    echo master_5
    cd /home/$USER/fmaster
    geth --identity "master_5" --mine --targetgaslimit '42000000' --syncmode "full" --networkid 1504 --port "30320" --rpc --rpcaddr "0.0.0.0" --rpcport "8545" --datadir "./data" --rpccorsdomain "*" --nat "any" --rpcapi eth,web3,personal,net --ipcpath "~/.ethereum/geth.ipc" --unlock 03e1Ba68651c7C953ab0874D5f488F2734347906 --allow-insecure-unlock --nodiscover console
}



node1_15(){
    echo node1_15
    cd /home/$USER/node1
    geth --identity "node1_15" --mine --targetgaslimit '42000000' --syncmode "full" --networkid 1504  --datadir "./data" --rpc --rpcaddr "0.0.0.0" --rpcport "8546" --port "30321" --rpccorsdomain "*" --nat "any" --rpcapi eth,web3,personal,net --ipcpath "~/.ethereum/geth.ipc"  --unlock 204ae41b745CeE8301fcaEC7Add626718735CCd2 --allow-insecure-unlock --nodiscover console
}

node1_5(){
    echo node1_5
    cd /home/$USER/fnode1
    geth --identity "node1_5" --mine --targetgaslimit '42000000' --syncmode "full" --networkid 1504  --datadir "./data" --rpc --rpcaddr "0.0.0.0" --rpcport "8546" --port "30321" --rpccorsdomain "*" --nat "any" --rpcapi eth,web3,personal,net --ipcpath "~/.ethereum/geth.ipc"  --unlock 0xC4d181E0A3784E4F39E2F428aC164f01a1b85183 --allow-insecure-unlock --nodiscover console
}


node2_15(){
    echo node2_15
    cd /home/$USER/node2
    geth --identity "node2_15" --mine --targetgaslimit '42000000' --syncmode "full" --networkid 1504  --datadir "./data" --rpc --rpcport "8547" --rpcaddr "0.0.0.0"  --port "30322" --rpccorsdomain "*" --nat "any" --rpcapi eth,web3,personal,net --ipcpath "~/.ethereum/geth.ipc"  --unlock BC6596a9A1584e21d94DC65F606078dE8857db20  --allow-insecure-unlock --nodiscover console
}

node2_5(){
    echo node2_5
    cd /home/$USER/fnode2
    geth --identity "node2_5" --mine --targetgaslimit '42000000' --syncmode "full" --networkid 1504  --datadir "./data" --rpc --rpcport "8547" --rpcaddr "0.0.0.0"  --port "30322" --rpccorsdomain "*" --nat "any" --rpcapi eth,web3,personal,net --ipcpath "~/.ethereum/geth.ipc"  --unlock e7b4EE0A3131A84832a297B41Ee15FdC38E0ce94  --allow-insecure-unlock --nodiscover console
}


usage() {
    cat 1>&2 <<EOF
The script is for setting up ipfs and ipfs cluster enviornment.
USAGE:
    bash setIPFS.sh [FLAGS] [OPTIONS]
FLAGS:
    --master_15                If you are master node (signer)15 
    --master_5                If you are master node (signer)5
    --node1_15                 If you are node1 15
    --node1_5                 If you are node1 5
    --node2_15                 If you are node2 15
    --node2_5                 If you are node2 5
EOF
}

case "$1" in
  --master_15) shift; master_15 $@ ;;
  --master_5) shift; master_5 $@ ;;
  --node1_15) shift; node1_15 $@ ;;
  --node1_5) shift; node1_5 $@ ;;
  --node2_15) shift; node2_15 $@ ;;
  --node2_5) shift; node2_5 $@ ;;
  -h|--help)
      usage
      exit 0
      ;;
  *) usage
     exit 0
     ;;
esac
