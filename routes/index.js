var express = require("express");
var router = express.Router();

const request = require("request");
const fs = require("fs");
const path = require('path');
const readline = require("readline-sync");
const xmlbuilder = require("xmlbuilder");

const subscriptionKey = "cea56718e9094744a4edf6778cbcb8b3";

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/tts/payload", (req, res, next) => {
  fs.readFile("speech.JSON", (err, data) => {
    if (err) throw new Error(err);
    let json = JSON.parse(data);

    // let truffle = shuffleArray(json);

    let splicedJson = json.slice(0, 29);

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
      .forEach(obj => {
        textToSpeech(subscriptionKey, saveAudio, obj);
      });
  });
  res.send("file is ready, yay!");
});


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

textToSpeech = (subscriptionKey, saveAudio, dialogueObj) => {
  let options = {
    method: "POST",
    uri: "https://eastus.api.cognitive.microsoft.com/sts/v1.0/issueToken",
    headers: {
      "Ocp-Apim-Subscription-Key": subscriptionKey
    }
  };

  getToken = (error, response, body) => {
    if (!error && response.statusCode == 200) {
      saveAudio(body, dialogueObj);
    } else {
      throw new Error(error);
    }
  };

  request(options, getToken);
};

saveAudio = (accessToken, dialogueObj) => {
  console.log(accessToken, dialogueObj);
  let voiceActor = `Microsoft Server Speech Text to Speech Voice (en-US, ${
    dialogueObj.voice_actor
  })`;
  let fileName = `${dialogueObj.index}_${dialogueObj.character}.wav`;
  console.log(dialogueObj.text);

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
    baseUrl: "https://eastus.tts.speech.microsoft.com/",
    url: "cognitiveservices/v1",
    headers: {
      Authorization: "Bearer " + accessToken,
      "cache-control": "no-cache",
      "User-Agent": "YOUR_RESOURCE_NAME",
      "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm",
      "Content-Type": "application/ssml+xml"
    },
    body: body
  };

  console.log('options', options);
  // This function makes the request to convert speech to text.
  // The speech is returned as the response.
  function convertText(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Converting text-to-speech. Please hold...\n");
    } else {
      throw new Error(error);
    }
    // let pathName = path.resolve(__dirname, "../assets/laughs");
    // console.log('pathName', pathName);
    //  fs.readdir(path.resolve(__dirname, "../assets/laughs"), (err, files) => {
    //    if (err) throw new Error(err);
    //   console.log('reading dir', files)
    //   shuffleArray(files);

    //   files.map(file => {
    //     fs.readFile(`${pathName}/${file}`, (err, data) => {
    //       if (err) throw new Error(err);
    //       fs.writeFile(`${dialogueObj.index}_${dialogueObj.character}.wav`, data, (err) => {
    //         console.log('writing file, but where?');
    //         if (err) throw new Error(err);
    //       });
    //     })
    //   })
    // });
    console.log("Your file is ready.\n");
  }
  // Pipe the response to file.
  request(options, convertText).pipe(fs.createWriteStream(fileName));
};

module.exports = router;
