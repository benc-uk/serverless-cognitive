//
// Main App and Vue instance
//
var app = new Vue({
  
  // Root element
  el: '#app',

  // Top level state
  data: {
    results: [],
    blobs: [],
    timer: null,
    blobService: null,
    updating: false,
    storageAccount: ''
  },

  // Lifecycle hook: initialize the app
  created: function () {
    // Moved from static config to URL query param
    var urlString = window.location.href
    var url = new URL(urlString);
    this.storageAccount = url.searchParams.get("sa");

    if(!this.storageAccount) return;

    this.blobService = AzureStorage.createBlobServiceAnonymous(`https://${this.storageAccount}.blob.core.windows.net/`);
    this.refreshData();
    this.timer = setInterval(this.refreshData, REFRESH_INTERVAL * 1000)
  },

  // Lifecycle hook: Clean up
  beforeDestroy: function() {
    clearInterval(this.timer)
  },

  // App methods
  methods: {
    
    // Fetch data results from Azure
    refreshData: function () {
      if(!this.storageAccount) return;
      this.updating = true;

      // List all blobs in our container
      this.blobService.listBlobsSegmented(CONTAINER, null, (error, results) => {
        if (error) {
          console.log(error);
        } else {
          // Loop through results 
          for (var i = 0, blob; blob = results.entries[i]; i++) {
            var blobName = blob.name;
            
            // Only add new items, so check if id already added, saves on network traffic
            if(!this.blobs.includes(blobName)) {
              this.blobs.push(blobName);
              let blobUrl = `https://${this.storageAccount}.blob.core.windows.net/${CONTAINER}/${blobName}`;
              //console.log(`### Fetching ${blobUrl}`);
              
              // Each blob is a chunk of JSON which we need to fetch remotely
              fetch(blobUrl)
              .then(resp => {
                // Convert response to JSON
                return resp.json();
              })
              .then(result => {
                this.results.unshift(result);

                // Sort results
                this.results.sort((a, b) => {
                  return a.timestamp < b.timestamp;
                });
              })

            } else {
              // Ignore 
            }
          }
        }
      });
      
      this.updating = false;
    }
  }
})
