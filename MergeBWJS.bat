REM merge all BWJS javascript files into one file
"bin/MergeJS" Bridgeworks.js BWJS.manifest

REM compress file
java -jar "bin/yuicompressor-2.4.2.jar" Bridgeworks.js --charset utf-8 -o Bridgeworks-int.js

REM add license
"bin/MergeJS" Bridgeworks-min.js License.manifest

REM delete intermediate file
del Bridgeworks-int.js
