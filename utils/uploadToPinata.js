const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinataApiKey = process.env.Pinata_API;
const pinataSecretApi = process.env.Pinata_API_SECRET;
const pinata = new pinataSDK(pinataApiKey, pinataSecretApi);

// console.log("Uploading to IPFS");
async function storeImages(imagesFilePath) {
  const fullImagesPath = path.resolve(imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  let responses = [];

  console.log("Uploading to IPFS");
  for (fileIndex in files) {
    const images = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
    const options = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    };

    try {
      const response = await pinata.pinFileToIPFS(images, options);
      responses.push(response);
    } catch (e) {
      console.log(e);
    }
  }

  return { responses, files };
}

async function storeTokenUriMetada(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (e) {
    console.log(e);
  }

  return null;
}

module.exports = { storeImages, storeTokenUriMetada };
