const delete_File = '../log/deleteFile.txt';
let round = 2, i = 0;

var text = require('fs').readFileSync('./pinls.txt', 'utf8')
//console.log(text.toString());
let textByLine = text.split("\n");
let data = "";
for (let i = 0; i < round; i++) {
  //console.log(textByLine[i]);
  if (i + 1 == round)
    data += textByLine[i]
  else
    data += textByLine[i] + '\n';

}
require('fs').writeFileSync(delete_File, data);
console.log(data);
console.log("done")