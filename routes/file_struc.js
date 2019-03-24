const fs = require('fs');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

fs.readdir('../assets/laughs', (err, files) => {
    if (err) throw new Error(err);
    
    console.log(files);
  });


  // fs.readdir('../assets/laughs', (files) => {
    //   console.log('reading dir', files)
    //   shuffleArray(files);

    //   files.map(file => {
    //     fs.readFile(file, (err, data) => {
    //       if (err) throw new Error(err);
    //       fs.writeFile(`${obj.character}_laugh`, data, (err) => {
    //         if (err) throw new Error(err);
    //       });
    //     })
    //   })
    // });