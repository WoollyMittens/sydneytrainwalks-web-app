#echo "Removing the old concatenated script file"
#rm "./js/scripts.js"
#
#echo "Concatenating the script files"
#cat "./src/lib/*.js" > "./js/scripts.js"
#cat "./src/js/*.js" > "./js/scripts.js"
#
#echo "Starting compass compile"
#compass compile

node importjpg
node importexif
node importgpx
node importtiles
grunt prod
