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

        // Only update the page if photo not in existing photo list
        if (!photos.includes(blob.name)) {
          photos.push(blob.name);
          $("<div class='m-3 p-2 card w-100'><img class='w-100' src='" + blobUrl + "'/></div>").prependTo($('#photos'));
        }
      }

      $('#loader').css('visibility', 'hidden');
    }
  });
}

// Set the storage account (sa) on the URL query string
function setSA() {
  let sa = $('#sa').val();
  var searchParams = new URLSearchParams(window.location.search);
  searchParams.append("sa", sa);
  window.location.search = searchParams;
}