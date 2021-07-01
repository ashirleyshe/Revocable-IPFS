
#!/bin/bash
set -e

master(){
    echo master
    nohup 2>&1 ipfs daemon > ./IPFSd.log &
    #ps -ef | grep ipfs &
    nohup 2>&1 ipfs-cluster-service daemon > ./IPFSClus.log&

}


worker(){
    echo worker
    nohup 2>&1 ipfs daemon > ./IPFSd.log &
    nohup 2>&1 ipfs-cluster-service daemon --bootstrap /ip4/140.113.216.99/tcp/9096/ipfs/QmcXwXgXCa98LQZt8Xf2JkkET73Pk7AbZ5xWpu1HpB6DyZ > ./IPFSClus.log&
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
  --worker) shift; worker $@ ;;
  -h|--help)
      usage
      exit 0
      ;;
  *) usage
     exit 0
     ;;
esac