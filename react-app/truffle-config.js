module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // Default Ganache UI port
      network_id: "1337" // Connect to any network
      
    }
  },
  compilers: {
    solc: {
      version: "0.8.28", // Match installed Solidity version
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "london"
      }
    }
  }
};
