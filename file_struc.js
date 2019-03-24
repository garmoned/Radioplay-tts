const fs = require('fs');
const audioconcat = require('audioconcat');


fs.readdir('Audio_Files', (err, files) => {
    if (err) throw new Error(err);
    audioconcat(files)

    .concat('Episode_1.mp3')
    .on('start', function(command) {
        console.log('encoding processs started');
    })
    .on('error', function(err, stdout, stderr) {
        console.error(err);
        console.error('stderr', stderr);
    })
    .on('end', function(output) {
        console.error('audio output created in', output);
    })
  });
