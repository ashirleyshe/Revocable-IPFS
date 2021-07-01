#!/bin/bash
set -e

master(){
    echo master
    nohup 2>&1 ipfs daemon > /home/$USER/ipfs/IPFSd.log &
    #ps -ef | grep ipfs &
    nohup 2>&1 ipfs-cluster-service daemon > /home/$USER/ipfs/IPFSClus.log&

}

master_show(){
    echo master
    nohup 2>&1 ipfs daemon > /home/$USER/ipfs/IPFSd.log &
    #ps -ef | grep ipfs &
    ipfs-cluster-service daemon

}


worker(){
    echo worker
    nohup 2>&1 ipfs daemon > /home/$USER/ipfs/IPFSd.log &
    nohup 2>&1 ipfs-cluster-service daemon --bootstrap /ip4/140.113.216.99/tcp/9096/ipfs/QmcXwXgXCa98LQZt8Xf2JkkET73Pk7AbZ5xWpu1HpB6DyZ > /home/$USER/ipfs/IPFSClus.log&
}

worker_show(){
    echo worker
    nohup 2>&1 ipfs daemon > /home/$USER/ipfs/IPFSd.log &
    ipfs-cluster-service daemon --bootstrap /ip4/140.113.216.99/tcp/9096/ipfs/QmcXwXgXCa98LQZt8Xf2JkkET73Pk7AbZ5xWpu1HpB6DyZ
}

usage() {
    cat 1>&2 <<EOF
The script is for setting up ipfs and ipfs cluster enviornment.
USAGE:
    bash setIPFS.sh [FLAGS] [OPTIONS]
FLAGS:
    --master                If you are master node (initial node of ipfs)
    --worker                If you are new to this system
EOF
}

case "$1" in
  --master) shift; master $@ ;;
  --master_show) shift; master_show $@ ;;
  --worker) shift; worker $@ ;;
  --worker_show) shift; worker_show $@ ;;
  -h|--help)
      usage
      exit 0
      ;;
  *) usage
     exit 0
     ;;
esac