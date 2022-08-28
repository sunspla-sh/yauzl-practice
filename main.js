const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;

//readdirsync
//existssync

// const simpleZipBuffer = fs.readFileSync('./test_ca.zip');

// const simpleZipBuffer  = Buffer.from([
//   80,75,3,4,20,0,8,8,0,0,134,96,146,74,0,0,
//   0,0,0,0,0,0,0,0,0,0,5,0,0,0,97,46,116,120,
//   116,104,101,108,108,111,10,80,75,7,8,32,
//   48,58,54,6,0,0,0,6,0,0,0,80,75,1,2,63,3,
//   20,0,8,8,0,0,134,96,146,74,32,48,58,54,6,
//   0,0,0,6,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,180,
//   129,0,0,0,0,97,46,116,120,116,80,75,5,6,0,
//   0,0,0,1,0,1,0,51,0,0,0,57,0,0,0,0,0
// ]);

// function promisify(api){
//   return function(...args){
//     return new Promise(function(resolve, reject){
//       api(...args, function(err, response){
//         if(err) return reject(err);
//         resolve(response);
//       })
//     })
//   }
// }

const yauzlFromBuffer = promisify(yauzl.fromBuffer);

(async () => {
  
  console.log(__dirname);
  const foundDirArray = fs.readdirSync(__dirname);
  const foundZipArray = foundDirArray.filter(e => e.includes('.zip'))
  const dirNameArray =  foundZipArray.map(e => e.split('.zip')[0])
  console.log(foundDirArray)
  console.log(foundZipArray);
  console.log(dirNameArray)
  console.log(path.resolve(__dirname, 'node_modules'))
  for(let i = 0; i < dirNameArray.length; i++){
    console.log(dirNameArray[i] + ' exists: ', fs.existsSync(path.resolve(__dirname, dirNameArray[i])))
    //if not exists then make it
    if(!fs.existsSync(path.resolve(__dirname, dirNameArray[i]))){
      console.log('making ', dirNameArray[i])
      fs.mkdirSync(path.resolve(__dirname, dirNameArray[i]))
    }
    console.log('zip location: ', path.resolve(__dirname, dirNameArray[i] + '.zip'))
    // console.log('write location: ', path.resolve(__dirname, dirNameArray[i], 'asdf') )

    const simpleZipBuffer = fs.readFileSync(path.resolve(__dirname, dirNameArray[i] + '.zip'))

    const zipfile = await yauzlFromBuffer(simpleZipBuffer, { lazyEntries: true });
    console.log('number of entries: ', zipfile.entryCount);
    const openReadStream = promisify(zipfile.openReadStream.bind(zipfile));
    zipfile.readEntry();
    zipfile.on('entry', async entry => {
      console.log('found entry: ', entry.fileName);
      const stream = await openReadStream(entry);
      stream.on('end', () => {
        console.log('<EOF>');
        zipfile.readEntry();
      });
      const writePath = path.resolve(__dirname, dirNameArray[i], entry.fileName)
      const outputStream = fs.createWriteStream(writePath)
      outputStream.on('finish', () => {
        console.log('Wrote file ' + writePath);
      })
      outputStream.on('close', () => {
        console.log('autoclose')
      })
      stream.pipe(outputStream);
    });
    zipfile.on('end', () => {
      console.log('end of entries');
    });


  }
  
})();