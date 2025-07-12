require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // loads .env

console.log("Using PRIVATE_KEY:", process.env.PRIVATE_KEY);

module.exports = {
  solidity: "0.8.20",
  networks: {
    monad: {
      url: "https://testnet-rpc.monad.xyz",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
