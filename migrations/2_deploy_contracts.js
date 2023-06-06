const PixelPunks = artifacts.require("PixelPunks");

module.exports = function (deployer) {
  // Replace "FOLDER_CID" with the CID of the folder containing all metadata files
  deployer.deploy(PixelPunks, "https://aquamarine-embarrassing-eel-178.mypinata.cloud/ipfs/QmY2thV5xFYqT4ViifyxgwR56tYw8bQc3vc6xyoRGWd4Yw/");
};
