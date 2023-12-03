import { HardhatUserConfig } from "hardhat/config";
require("@openzeppelin/hardhat-upgrades");

import dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
dotenv.config();
const config: HardhatUserConfig = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    polygon_mumbai: {
      chainId: 80001,
      throwOnCallFailures: true,
      throwOnTransactionFailures: true,
      allowBlocksWithSameTimestamp: true,
      url: "https://polygon-testnet.public.blastapi.io",
      accounts: [process.env.ACCOUNT_PRIVATE_KEY as string],
    },
  },
  etherscan: {
    apiKey: "6ISC4MD9T66E9UDKKGZ5TBM3N7PUYDY9VV",
  },
};

export default config;
