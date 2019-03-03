var express = require('express');
var router = express.Router();

const request = require("request");
const fs = require("fs");
const readline = require("readline-sync");
const xmlbuilder = require("xmlbuilder");

const subscriptionKey = "c0a8baf6158d4a2b8a6eeabf5e11702d";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/tts/payload', (req, res, next) => {
  console.log(req.body);

  let parsed = req.body;
  let textPayload = parsed.payload;

  textToSpeech(subscriptionKey, saveAudio, textPayload);
  res.send('file is ready, yay!');
});

textToSpeech = (subscriptionKey, saveAudio, textPayload) => {
  let options = {
    method: "POST",
    uri: "https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken",
    headers: {
      "Ocp-Apim-Subscription-Key": subscriptionKey
    }
  };

  getToken = (error, response, body) => {
    if (!error && response.statusCode == 200) {
      saveAudio(body, textPayload);
    } else {
      throw new Error(error);
    }
  };

  request(options, getToken);
};

saveAudio = (accessToken, textPayload) => {
  // Create the SSML request.
  let text = textPayload;
  let xml_body = xmlbuilder
    .create("speak")
    .att("version", "1.0")
    .att("xml:lang", "en-us")
    .ele("voice")
    .att("xml:lang", "en-us")
    .att(
      "name",
      "Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)"
    )
    .txt(text)
    .end();
  // Convert the XML into a string to send in the TTS request.
  let body = xml_body.toString();

  let options = {
    method: "POST",
    baseUrl: "https://westus.tts.speech.microsoft.com/",
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
  // This function makes the request to convert speech to text.
  // The speech is returned as the response.
  function convertText(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Converting text-to-speech. Please hold...\n");
    } else {
      throw new Error(error);
    }
    console.log("Your file is ready.\n");
  }
  // Pipe the response to file.
  request(options, convertText).pipe(fs.createWriteStream("sample.wav"));
};


module.exports = router;
