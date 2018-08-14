//
// Main module
//

// Moved from static config to URL query param
var urlString = window.location.href
var url = new URL(urlString);
var STORAGE_ACCOUNT = url.searchParams.get("sa");

if(!STORAGE_ACCOUNT) {
  $('#loader').css('visibility', 'hidden');
  //$("#photos").append( "<h2>ERROR! Please provide storage account name as query parameter 'sa', e.g. ?sa=foobar</h2>" );
} else {
  $('#settings').hide();
}


// Client to access Azure blob storage 
// Anonymous access whoo yay!
var blobService = AzureStorage.createBlobServiceAnonymous('https://' + STORAGE_ACCOUNT + '.blob.core.windows.net/');

// Global array holds list of photos 
var photos = [];

//
// Fetch photos from blob storage and push into page
//
function listPhotos() {
  if(!STORAGE_ACCOUNT) return;
  $('#loader').css('visibility', 'visible');

  // List blobs in container
  blobService.listBlobsSegmented(CONTAINER, null, function (error, results) {
    if (error) {
      console.log(error);
    } else {
      // Loop through results 
      for (var i = 0, blob; blob = results.entries[i]; i++) {
        blobUrl = 'https://' + STORAGE_ACCOUNT + '.blob.core.windows.net/' + CONTAINER + '/' + blob.name;

        // Each blob is a chunk of JSON which we need to fetch remotely
        fetch(blobUrl)
        .then(resp => {
          // Convert response to JSON
          return resp.json();
        })
        .then(result => {
          // Now process each result, which will be for one image
          let imgUrl = result.srcUrl;
          let id = result.requestId;
          if (!photos.includes(imgUrl)) {

            photos.push(imgUrl);
            $(`<div class='m-3 p-2 card w-100' id='div_${id}'><img id='img_${id}' class='w-100' src='${imgUrl}'/></div>`).prependTo($('#photos'));

            // To get image size once loaded and add canvas
            document.getElementById('img_'+id).addEventListener('load', () => { drawOverlay(event, result); } );
          }
        })
      }

      $('#loader').css('visibility', 'hidden');
    }
  });
}

function drawOverlay(evt, result) {
  var canvas = document.createElement('canvas');
  let width = evt.target.clientWidth;
  canvas.width = width;
  canvas.height = evt.target.clientHeight;
  canvas.style.position = 'absolute';
  $(canvas).prependTo($(evt.target.parentElement));
  var ctx = canvas.getContext('2d');

  // Drawing cognitive results over image

  // Caption/title
  ctx.font = `${width/26}px 'Tahoma', sans-serif`;
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 4; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;
  ctx.fillStyle = 'white';
  ctx.fillText(toTitleCase(result.description.captions[0].text), 20, (width/30)+10);

  // Top three tags
  ctx.fillStyle = '#36c139'; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
  ctx.font = `${width/40}px 'Tahoma', sans-serif`;
  var t = 0;
  for(let tag of result.tags.slice(0, 3)) {
    ctx.fillText(`• ${tag.name} ${(Number.parseFloat(tag.confidence)*100).toFixed(2)}%`, 20, (width/30)+20+(t+=(width/35)));      
  }

  // Faces
  let scale = width / result.metadata.width;

  ctx.lineWidth = width/180;
  ctx.font = `${width/45}px 'Tahoma', sans-serif`;
  for(let face of result.faces) {
    if(face.gender == 'Male') {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.fillStyle = '#318dd8';
    } else {
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
      ctx.fillStyle = '#db48d3';
    }
    ctx.shadowColor = "transparent";
    ctx.strokeRect(face.faceRectangle.left*scale, face.faceRectangle.top*scale, face.faceRectangle.width*scale, face.faceRectangle.height*scale);  
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;
    ctx.fillText(`${face.gender} ${face.age}`, face.faceRectangle.left*scale-(10*scale), face.faceRectangle.top*scale-(10*scale) );
  }
}


// Set the storage account (sa) on the URL query string
function setSA() {
  let sa = $('#sa').val();
  var searchParams = new URLSearchParams(window.location.search);
  searchParams.append("sa", sa);
  window.location.search = searchParams;
}

function toTitleCase(str) {
  return str.replace(
      /\w\S*/g,
      function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
  );
}