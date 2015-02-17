REM merge all BWJS javascript files into one file
"bin/MergeJS" Bridgeworks.js BWJS.manifest

REM compress file
REM java -jar "bin/yuicompressor-2.4.2.jar" Bridgeworks.js --charset utf-8 -o Bridgeworks-int.js

REM uglify (minify/mangle) file
uglifyjs Bridgeworks.js --compress --mangle --output Bridgeworks-int.js

