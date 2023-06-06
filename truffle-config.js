const HDWalletProvider = require("@truffle/hdwallet-provider");
require('dotenv').config();

const minterPrivateKey = process.env.MINTER_PRIVATE_KEY;
const alchemyProjectId = process.env.ALCHEMY_PROJECT_ID;

module.exports = {
  networks: {
    polygon: {
      provider: () => new HDWalletProvider(minterPrivateKey, `https://polygon-mumbai.g.alchemy.com/v2/${alchemyProjectId}`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gasPrice: 10000000000,
    },
    mainnet: {
      provider: () => new HDWalletProvider(minterPrivateKey, `https://polygon-mainnet.alchemyapi.io/v2/${alchemyProjectId}`),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gasPrice: 10000000000,
    },
  },

  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.4",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  },

  db: {
    enabled: false
  }
};
