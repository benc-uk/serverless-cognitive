#!/bin/bash

# CHANGE THESE VALUES!
# Note. Pick a location where Vision API is available 
resGroup="Demo.ServerlessVision"
location="northeurope"

# CHANGE THESE VALUES IF YOU WISH
suffix="$RANDOM"
storeAcct="visiondemostore$suffix"
functionName="visiondemofunc$suffix"

echo "### Creating resource group"
az group create -n $resGroup -l $location

echo "### Creating Storage account"
az storage account create -n $storeAcct -g $resGroup -l $location --sku Standard_LRS
storeKey=`az storage account keys list -n $storeAcct -g $resGroup --query "[0].value" -o tsv`
echo "### Creating Blob containers"
az storage container create -n "photo-in" --account-name $storeAcct --account-key $storeKey --public-access blob
az storage container create -n "photo-out" --account-name $storeAcct --account-key $storeKey --public-access container
echo "### Configuring CORS"
az storage cors add --account-name $storeAcct --account-key $storeKey --methods GET --origins "*" --allowed-headers "*" --exposed-headers "*" --services b

echo "### Creating Vision API account"
az cognitiveservices account create -n "visionapi" -g $resGroup -l $location --sku F0 --yes --kind ComputerVision
apiKey=`az cognitiveservices account keys list -n "visionapi" -g $resGroup --query "key1" -o tsv`

echo "### Creating Function App"
az functionapp create -g $resGroup -c $location -n $functionName -s $storeAcct --os-type Windows --runtime node --deployment-source-url "https://github.com/benc-uk/serverless-cognitive.git"
echo "### Configuring Function App"
az functionapp config appsettings set -g $resGroup -n $functionName --settings VISION_API_KEY=$apiKey VISION_API_REGION=$location FUNCTIONS_WORKER_RUNTIME=node WEBSITE_NODE_DEFAULT_VERSION=8.11.1

echo ""
echo "##################################################################################"
echo ""
echo "Deployment complete!"
echo ""
echo "Access the camera here: https://$functionName.azurewebsites.net/api/cameraFunction"
echo "View results here: http://code.benco.io/serverless-cognitive/viewer/?sa=$storeAcct"
echo ""
echo "##################################################################################"
