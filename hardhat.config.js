require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_PROJECT_ID}`,
      accounts: [process.env.MINTER_PRIVATE_KEY]
    }
  }
};
