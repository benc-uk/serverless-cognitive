# Overview
This guide will step you through deploying a multi part application which demonstrates using serverless compute with Azure Functions combined with the pre-built machine learning models of Cognitive Services 

With this application users can take photos using their phone, these photos are analysed using computer vision. The results have a description of the image, people's faces and also a set of tags. The demo app stores this information and the results are dynamically updated & displayed on a web page

The system consists of four main parts:
- Camera web app
- Two Azure Functions 
- Computer Vision Cognitive Service
- Viewer JavaScript webapp, written in Vue.js


# Architecture
![diagram of architecture](diagram.png){: .framed}


## Application Flow 

0. User loads camera web app on mobile device, via public URL of an Azure Function and takes photo
1. Image is HTTP POSTed from camera app as Base64 string back to same Azure Function
2. Azure Function decodes Base64 data and stores resulting image in Blob Storage, into *photo-in* container
3. Second Azure Function is triggered on a new blob arriving at *photo-in* 
4. Function sends image to Cognitive Service API (REST call) and gets the JSON result
5. Result is stored in *photo-out* container as a blob of JSON
6. Static HTML5 viewing page polls *photo-out* for new blobs and updates page dynamically by fetching and reading the JSON  
Viewing page renders details as overlays on the images, such as the caption, tags and location of faces (using HTML5 Canvas API)

## Example (Viewer Results Webapp)
![demo](demo.png){: .framed}


# Deployment & Setup
The system requires a single Function App, storage account and Cognitive Services account. Using a consumption plan for the Function App means the costs for deploying the system are extremely small.

## Deployment Script 
A bash script (`deploy.sh`) for automated deployment is provided, which will create everything and deploy all the Functions code. The default resource group is called ****Demo.ServerlessVision**** and deploys to **North Europe**, you can modify the script to change these defaults.  

To run the script you will need the Azure CLI installed and configured and either run the script locally under WSL bash or simply use the Azure Cloud Shell

- **Step 1** Go to shell.azure.com and login
- **Step 2** Run `curl -s https://raw.githubusercontent.com/benc-uk/serverless-cognitive/master/deploy.sh | bash`

## Manual Deployment
All these steps use the Azure Portal, and assume you already have an Azure subscription

### 1. Deploy a new Azure Function App using the Portal 
- Click; *New ➔ Compute ➔ Function App*
 - Pick any unique name for your app
- Pick Windows as the OS
- Opt to create a new resource group, give it any name that you wish
- For the *Hosting Plan* Select "Consumption Plan"
- Opt to create a new storage account, and make a note of the name
- Turn off Application Insights

### 2. Deploy Computer Vision Cognitive Service
- Click; *New ➔ AI + Machine Learning ➔ Computer Vision*
- You **must pick West Europe as the location**, and also F0 (free) as the pricing tier
- Place in same resource group used for the Function App
- Once the Computer Vision Cognitive Service is deployed, click into the resource and click on keys. Copy "Key 1" somewhere, e.g. into a text file.

### 3. Deploy & code to Functions & Configure
- We will deploy the function code from the main [source GitHub repo](https://github.com/benc-uk/serverless-cognitive):
  - Click into your new Function App from the Portal, you will be taken to the Functions Portal
  - Click: *Platform Features ➔ Deployment Options* (It is listed under CODE DEPLOYMENT)
  - Click: *Setup ➔ Choose Source ➔ External Repository*
  - Enter `https://github.com/benc-uk/serverless-cognitive.git` as the URL, and the branch as "master". Click OK
  - It might take a few seconds, but the view will refresh and you will see a tick, indicating the code has deployed
  - Close the deployments view
- Click the list of Functions on the left side, and two functions; *cameraFunction* and *cognitiveFunction* should appear
- Get the URL of the camera app, click: on the *cameraFunction* then click on "</> Get function URL" at the top. Copy this URL somewhere, as you will need to open it on your mobile, creating a short link or sending it over to your phone as a message/email will save you typing it in
- Configure the functions to access your Cognitive Service:
  - Return to the Function App level view by clicking on the Function App name (with the yellow lighting bolt icon) on the left
  - Click on "Overview" tab in the top of the Function Portal and into "Application settings"
  - Scroll down & click "+ Add new setting"
  - Call the setting **VISION_API_KEY** and paste the key you copied previously as the value
  - Remember to scroll back up & click "Save"

### 4. Setup Blob Storage 
- Return to the resource group. You can do this via the breadcrumb trail at the top of the Portal view
- Click into the storage account that was created in step 1 with the Function App
  - Click on "Blob Service / Browse blobs"
  - Click "+ Container", call it **photo-in** and **set the access level to 'Blob'**
  - Click "+ Container", call it **photo-out** and **set the access level to 'Container'**
  - Click on "Blob Service / CORS", and click "+ Add"
  - Set the rule up with asterisk '*' (no quotes) for allowed origins, allowed headers and exposed headers, select GET as the allowed verbs and leave the max age as 0


# Usage
- Open the camera web app on your phone using the URL you got earlier, it will be of the form  
`https://{function-app-name}.azurewebsites.net/api/cameraFunction`
- Tap the button & icon to take a photo (or pick existing photo on your device) and upload to Azure triggering the whole flow described above 
- Open the viewer:
  - The viewer is currently [**hosted publicly on GitHub pages**](http://code.benco.io/serverless-cognitive/viewer)
  - If you have cloned or downloaded the [source repo](https://github.com/benc-uk/serverless-cognitive), just open `viewer/index.html` locally in your browser
  - You will need to point the viewer at your storage account, so enter your storage account name and click OK
- Note. The viewer automatically fetches new photos every 10 seconds and displays them, so **do not reload or refresh the page**


# Viewer
If you want to host the viewer yourself in Azure, you can:
- Upload the viewer folder of this repo to blob storage give the container anonymous access and load the pages using the blob endpoint URL, e.g. https://mystoreaccount.blob.core.windows.net/viewer/index.html
- Create an Azure App Service web app and upload the contents of the viewer folder to the root of your web app


# Design Notes
Being a demo app, certain design choices were made that cut corners in order to simplify things:
- Using Azure Functions to return HTML pages is generally not a recommended use case, as there are better ways to achieve that in Azure (Web Apps, Storage Static Sites etc)
- Storing JSON in blobs isn't optimal, and something such as Table storage or even Cosmos DB represents a better fit. However the advantage of blobs is the option of anonymous access which simplifies viewing the results


# Change Log
- **Aug 2018:** Complete re-design. Functions rewritten in Node.js for use with Functions v2. Viewer app rewritten in Vue.js.