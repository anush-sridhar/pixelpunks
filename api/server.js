const express = require('express');
const Web3 = require('web3');
const dotenv = require('dotenv');
const contractABI = require("./build/contracts/PixelPunks.json").abi;
const axios = require("axios");

dotenv.config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

const alchemyProjectId = process.env.ALCHEMY_PROJECT_ID;
const web3 = new Web3(new Web3.providers.HttpProvider(`https://polygon-mumbai.g.alchemy.com/v2/${alchemyProjectId}`));

const contractAddress = '0xb49Be80fE5d0f204707eFDAF750182edb2E3C5Ea';
const nftContract = new web3.eth.Contract(contractABI, contractAddress);

const folderCID = "QmY2thV5xFYqT4ViifyxgwR56tYw8bQc3vc6xyoRGWd4Yw";
const numberOfNFTs = 1000;

let mintedTokens = new Set();

async function isTokenMinted(tokenId) {
  try {
    const owner = await nftContract.methods.ownerOf(tokenId).call();
    return true;
  } catch (error) {
    return false;
  }
}

async function mintNFT(recipient, isRare) {
  const privateKey = process.env.MINTER_PRIVATE_KEY;
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  let txData;
  let gasEstimate;
  let nextTokenId;
  
  if (isRare) {
    txData = nftContract.methods.mintRare(recipient).encodeABI();
    gasEstimate = await nftContract.methods.mintRare(recipient).estimateGas();
    nextTokenId = mintedTokens.size + 1;
  } else {
    txData = nftContract.methods.mintCommon(recipient).encodeABI();
    gasEstimate = await nftContract.methods.mintCommon(recipient).estimateGas();
    nextTokenId = mintedTokens.size + 501;
  }

  const transaction = { to: contractAddress, data: txData, gas: gasEstimate };
  const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
  const txReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

  mintedTokens.add(nextTokenId);

  return txReceipt;
}

app.post("/mintRare", async (req, res) => {
  try {
    const recipient = req.body.recipient;

    if (!recipient) {
      res.status(400).send("Please provide a recipient address.");
      return;
    }

    if (mintedTokens.size >= numberOfNFTs / 2) {
      res.status(400).send("All rare tokens have been minted.");
      return;
    }

    const txReceipt = await mintNFT(recipient, true);
    const metadataURL = `https://aquamarine-embarrassing-eel-178.mypinata.cloud/ipfs/${folderCID}/metadata-${mintedTokens.size}.json`;
    if (txReceipt) {
      res.status(200).json({ 'url': metadataURL, 'hash': txReceipt.transactionHash });
    } else {
      throw new Error('Could not mint NFT.');
    }
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send(`Error in /mintRare: ${error}`);
  }
});

app.post("/mintCommon", async (req, res) => {
  try {
    const recipient = req.body.recipient;

    if (!recipient) {
      res.status(400).send("Please provide a recipient address.");
      return;
    }

    if (mintedTokens.size >= numberOfNFTs) {
      res.status(400).send("All common tokens have been minted.");
      return;
    }

    const txReceipt = await mintNFT(recipient, false);
    const metadataURL = `https://aquamarine-embarrassing-eel-178.mypinata.cloud/ipfs/${folderCID}/metadata-${mintedTokens.size + 500}.json`;
    if (txReceipt) {
      res.status(200).json({ 'url': metadataURL, 'hash': txReceipt.transactionHash });
    } else {
      throw new Error('Could not mint NFT.');
    }
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send(`Error in /mintCommon: ${error}`);
  }
});

app.post('/getRes', async (req, res) => {
  try {
    const url = req.body.url;
    console.log(`For URL: ${url}`);
    const result = await axios.get(url, { timeout: 10000 });
    const data = result.data;
    res.status(200).json({ 'imageUrl': data.image, 'rarity': data.attributes[0].value });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send(`Error in /getRes: ${error}`);
  }
});

module.exports = app;
