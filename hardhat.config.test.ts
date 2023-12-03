import { HardhatUserConfig } from "hardhat/config";
require("@openzeppelin/hardhat-upgrades");

import dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
dotenv.config();
const config: HardhatUserConfig = {
  solidity: "0.8.20",
};

export default config;
