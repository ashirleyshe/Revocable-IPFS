const delete_File = '../log/deleteFile.txt';
const fs = require('fs');


(async () => {
  var lines = await fs.readFileSync(delete_File, 'utf-8')
  .split('\n')  
  .filter(Boolean);
  console.log(lines);
  console.log(lines[0]);

  let apifcnt;
  let roundth = 0, round = ((lines.length)/20) >> 0;
  if (lines.length%20>0)
  round +=1;


  // ---write log file to smart contract(20at a time)----
  while(round--){
    if (round !=0) ub = 20;
    else ub = lines.length%20;

    var ub, js_localunpinls = {"mode":"normal_unpin","0":ub};
    // convert image to base64 encoded string
    for (var i = roundth*20, j=0; i < (roundth+1)*20 && i<lines.length, j < ub; i++,j++){
    js_localunpinls[j+1] = lines[i];
    }
    console.log(js_localunpinls);
  }

})();
