var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var axios = require('axios');
const mongURI = 'mongodb+srv://Admin:iamadmin@mismatch-lla7j.azure.mongodb.net/test?retryWrites=true&w=majority';
const request = require("request-promise");
const fs = require("fs").promises;
const ofs = require('fs');
const path = require('path');
const readline = require("readline-sync");
const xmlbuilder = require("xmlbuilder");
const Grid = require('gridfs-stream')



const subscriptionKey = "cea56718e9094744a4edf6778cbcb8b3";

/* GET home page. */
router.get("/", function(req, res, next) {
  
  res.render("index", { title: "Express" });
});

let mongoOptions = { 
  reconnectTries: Number.MAX_VALUE, 
  reconnectInterval: 500,
  useNewUrlParser: true
}
var gfs;

mongoose.connect(mongURI,mongoOptions);
mongoose.connection.once("open" , ()=>{
  gfs = Grid(mongoose.connection.db,mongoose.mongo);
})




router.use(bodyParser());

let locations = [];


router.get('/tts/getScript',(req,res) =>
{

  locations = [];

  var fileNames = [];
  gfs.files.find().map((file)=>{

    console.log(file.fileame)
    fileNames.push(file.filename)

  })
  
  gfs.exist

  res.send(JSON.stringify(fileNames));

})


router.post("/tts/payload", async (req, res, next) => {
    console.log('here')
    locations = [];

    await mongoose.connection.dropCollection('fs.files');
    await mongoose.connection.dropCollection('fs.chunks');
    
    let data = req.body.scriptData;
    //console.log(data);


    let json = data;

    // let truffle = shuffleArray(json);

    let splicedJson = json.slice(0, data.length);

    let indexedJson = splicedJson
      .map((obj, index) => {
        obj.index = index;
        if (obj.character === "Jerry_Seinfeld") {
          obj.voice_actor = "BenjaminRUS";
        }
        if (obj.character === 'George_Costanza') {
          obj.voice_actor = "Guy24kRUS";
        }
        return obj;
      })
     
      for (const obj of indexedJson){

        let tokenOptions = {
          method: "POST",
          url: "https://eastus.api.cognitive.microsoft.com/sts/v1.0/issueToken",
          headers: {
            "Ocp-Apim-Subscription-Key": subscriptionKey
          }
        };

       let token = await request(tokenOptions);

        await saveAudio(token,obj)
        .catch((err)=>{
          if (err) throw new Error(err);
        });

      }

      res.send(JSON.stringify(locations))


      

});


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

saveAudio = async (accessToken,dialogueObj) => {
  //console.log(accessToken, dialogueObj);

  let voiceActor = `Microsoft Server Speech Text to Speech Voice (en-US, ${
    dialogueObj.voice_actor
  })`;
  let fileName = `${dialogueObj.index}_${dialogueObj.character}.wav`;
  //console.log(dialogueObj.text);
  
  // Create the SSML request.
  let xml_body = xmlbuilder
    .create("speak")
    .att("version", "1.0")
    .att("xml:lang", "en-us")
    .ele("voice")
    .att("xml:lang", "en-us")
    .att("name", voiceActor)
    .ele("prosody")
    .att("rate", "-25.00%")
    .txt(dialogueObj.text)
    .end();
  // Convert the XML into a string to send in the TTS request.
  let body = xml_body.toString();



  let options = {
    method: "POST",
    url: "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1",
    headers: {
      'Content-Type': 'text/xml',
      Authorization: "Bearer " + accessToken,
      "cache-control": "no-cache",
      "User-Agent": "YOUR_RESOURCE_NAME",
      "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm",
      "Content-Type": "application/ssml+xml"
    },
    
      body: body
    
  };
  
 var writeStream = gfs.createWriteStream({
    filename : fileName,
    contentType:'audio/x-wav'
  })


  await request(options).pipe(writeStream);

  let data = {
    name : dialogueObj.character,
    fileName :fileName
  }

  locations.push(data);

  console.log('wrote', fileName);

}



  
module.exports = router;
