#! /bin/bash
cd uploadFiles
for n in {1..1}; do
   dd if=/dev/urandom of=file$( printf %03d "$n" ).pdf bs=1024 count=10
done

