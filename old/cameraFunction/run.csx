using System.Net;

//
// Multi purpose Function.
// - Serves the camera single page "mobile app" (static HTML file)
// - Receives images from the camera app and saves them to blob storage 
// 
public static HttpResponseMessage Run(HttpRequestMessage req, Stream outputBlob, TraceWriter log)
{
    // If we get a POST - it's an image being uploaded from the camera app
    // So... Base64 decode it and write to the outputBlob stream 
    if(req.Method == HttpMethod.Post) {
        String base64img = req.Content.ReadAsStringAsync().Result;
        byte[] data = Convert.FromBase64String(base64img);

        Stream stream = new MemoryStream(data);
        outputBlob.Write(data, 0, data.Length);

        return req.CreateResponse(HttpStatusCode.OK);
    }

    // If we get receive a GET, lets serve up a page of static HTML
    // This page is the HTML5/JS camera mini "app" that will POST photos back to this Function in Base64 format
    // NOTE. Serving static content like this from a Function, is a really hacky thing to do! Not best practice!
    if (req.Method == HttpMethod.Get) {
        HttpResponseMessage resp = req.CreateResponse(HttpStatusCode.OK);
        
        // Look I told you this was a hack! I feel bad about this code now
        string html = System.IO.File.ReadAllText(@"D:\home\site\wwwroot\cameraFunction\camera.html");
        var content = new StringContent(html, System.Text.Encoding.UTF8, "text/html");
        resp.Content = content;
        return resp;
    } else {
        return req.CreateResponse(HttpStatusCode.MethodNotAllowed);
    }
}
