
//
// Photo analysis function using Azure Cognitive Service Vision API
// Ben Coleman, Aug 2018
//

const VISION_API_KEY = process.env.VISION_API_KEY;
const VISION_API_REGION = process.env.VISION_API_REGION || "westeurope"
const VISION_API_ENDPOINT = `https://${VISION_API_REGION}.api.cognitive.microsoft.com/vision/v1.0/analyze`;
const request = require('request');

module.exports = function (context, blobTrigger) {
  context.log("### New photo uploaded, starting analysis...");

  // Create JSON request object, it's simply the URL of the image we want to analyse
  let cognitiveRequest = {
    url: VISION_API_ENDPOINT + '?visualFeatures=Categories,Tags,Description,Faces,ImageType,Color&details=Celebrities',
    headers: {'content-type': 'application/json', 'Ocp-Apim-Subscription-Key': VISION_API_KEY},
    body: JSON.stringify({
      url: context.bindingData.uri
    })
  };

  // Send request to cognitive API
  request.post(cognitiveRequest, (err, resp, body) => {
    if(!err && resp.statusCode == 200) {
      context.log("### Cognitive API called successfully");

      // We want to inject the original image URL into our result object
      // So we have to parse, modify and then re-stringify
      respJson = JSON.parse(body);
      context.log("### That looks a bit like: "+respJson.description.captions[0].text);
      context.log("### Tags: "+JSON.stringify(respJson.tags));

      // Mutate the object and insert extra properties used by viewer app
      respJson.srcUrl = context.bindingData.uri;
      respJson.timestamp = new Date().getTime();
      respJson.dateTime = new Date().toISOString();

      // Saving result to blob is very easy with Functions, we just assign the output variable
      context.bindings.outputBlob = JSON.stringify(respJson);
      context.done();
      context.log("### Function completed");
    } else {
      // Error and general badness happened
      context.log("### Error! Cognitive API call failed!");
      context.log(err || "");
      context.log(body || "");
      context.done();
    }
  });

};