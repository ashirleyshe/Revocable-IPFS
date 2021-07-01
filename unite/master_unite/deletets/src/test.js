var delete_File = '../log/deleteFile.txt';
var round = 2, i = 0;
var text = require('fs').readFileSync('./pinls.txt', 'utf8');
//console.log(text.toString());
var textByLine = text.split("\n");
var data = "";
for (var i_1 = 0; i_1 < round; i_1++) {
    //console.log(textByLine[i]);
    if (i_1 + 1 == round)
        data += textByLine[i_1];
    else
        data += textByLine[i_1] + '\n';
}
require('fs').writeFileSync(delete_File, data);
console.log(data);
console.log("done");
