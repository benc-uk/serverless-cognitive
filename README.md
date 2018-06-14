# Overview
This is a multi part application which demonstrates serverless compute with Azure Functions and using pre-built AI models with Cognitive Services 

Users can take photos using their phone, these photos are analysed using computer vision. The results have a description of the image, people's faces and also a set of tags. The demo app updates the photo with information and the results can be viewed on a web page.

The demo consists of four main parts:
- Mobile camera application 
- Two Azure Functions 
- Computer Vision Cognitive Service
- Viewer web app

# Architecture
![diagram of architecture](https://user-images.githubusercontent.com/14982936/41406894-aa6c57cc-6fc5-11e8-86fc-502aa94c1503.png)

## Application Flow 

0. User loads camera app on mobile device, from Azure Function (via a public URL) and takes photo
1. Image is HTTP POSTed from camera app as Base64 string back to same Azure Function
2. Azure Function decodes Base64 data and stores resulting image in Blob Storage into *photo-in* container
3. Second Azure Function is triggered on a new blob arriving at *photo-in* 
4. Function sends image to Cognitive Service API (REST call) and uses result to render a new image with details "drawn" over the photo
5. Result is stored in *photo-out* container in Blob Storage
6. Static HTML5 viewing page polls *photo-out* for new images and updates page dynamically


# Deployment & Setup
The demo requires a single Function App, storage account and Cognitive Services account. Using a consumption plan for the Function means the costs for leaving the demo in place are almost nothing.

- Deploy a new Azure Function App using the Portal (New ➔ Compute ➔ Function App):
  - Pick Windows as the OS.
  - If you have an existing App Service Plan you can use, then select that as the Hosting Plan, otherwise pick "Consumption Plan"
  - Turn off Application Insights
  - Create a new storage account
- Add a Computer Vision account (New ➔ AI + Machine Learning ➔ Computer Vision)
  - You **must pick West Europe as the location**, and also F0 (free) as the pricing tier
  - Place in same resource group used for the Function App
- Once the Computer Vision Cognitive Service is deployed, click into the resource and click on keys. Copy "Key 1" somewhere, e.g. into a text file.
- Deploy the function code from this GitHub repo:
  - Go into the Function App from the Portal
  - Click: Platform Features ➔ Deployment Options
  - Click: Setup ➔ Choose Source ➔ External Repository, and enter `https://github.com/benc-uk/serverless-cognitive.git` as the URL
  - It might take a minute, but refresh the list of Functions on the left (where it says "Functions (Read Only)") and *cameraFunction* and *cognitiveFunction* should appear
- Get the URL of the camera app, click: on *cameraFunction* then click on "</> Get function URL", make a note or copy this URL somewhere, as you will need to open it on your mobile. Creating an aks.ms short link is one suggestion
- Configure the functions to access your Cognitive Service:
  - Click on "Overview" tab in the Function Portal and into "Application settings"
  - Click "+ Add new setting"
  - Call the setting **VISION_API_KEY** and paste the key you copied previously as the value
  - Remember to click "Save"
- Configure the blob containers for the photos 


# Usage
Blah