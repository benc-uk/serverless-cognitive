//
// Main module
//

// Client to access Azure blob storage 
var blobService = AzureStorage.createBlobService(STORAGE_ACCOUNT, STORAGE_KEY);

// Global array holds list of photos 
var photos = [];

//
// Fetch photos from blob storages and push into page
//
function listPhotos() {
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
