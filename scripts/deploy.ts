import { ethers } from "hardhat";
import dotenv from "dotenv";
import { AbiCoder } from "ethers";

async function main() {
  dotenv.config();

  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = ethers.parseEther("0.001");

  /*const lock = await ethers.deployContract("Lock", [unlockTime], {
    value: lockedAmount,
  });
  */

  const [owner, otherAccount] = await ethers.getSigners();

  const Joy = await ethers.getContractFactory("Joy");
  const joy = await Joy.deploy();
  const joyTokenAddress = await joy.getAddress();
  const JoyCrowdsale = await ethers.getContractFactory("Crowdsale");

  const crowSaleConstructorArgs = {
    rate: 1,
    wallet: owner.address,
    token: joyTokenAddress,
    cap: 1000000000,
    closingTime: 10000000000000,
  };

  const joyCrowdSale = await JoyCrowdsale.deploy(
    crowSaleConstructorArgs.rate,
    crowSaleConstructorArgs.wallet,
    crowSaleConstructorArgs.token,
    crowSaleConstructorArgs.cap,
    crowSaleConstructorArgs.closingTime
  );

  const encodArgs = new AbiCoder().encode(
    ["uint256", "address", "address", "uint256", "uint256"],
    [
      crowSaleConstructorArgs.rate,
      crowSaleConstructorArgs.wallet,
      crowSaleConstructorArgs.token,
      crowSaleConstructorArgs.cap,
      crowSaleConstructorArgs.closingTime,
    ]
  );

  const args = console.log({
    encodArgs,
  });

  await joy.transfer(await joyCrowdSale.getAddress(), 10000);
  //await joy.waitForDeployment();
  const joyTokenAddres = await joy.getAddress();
  const joyCrowdsaleAddress = await joyCrowdSale.getAddress();

  console.log("Joy deployed to:", joyTokenAddres);
  console.log("JoyCrowdsale deployed to:", joyCrowdsaleAddress);

  const requestAddressTokenJoy = `https://api.polygonscan.com/api?module=contract&action=getcontractcreation&contractaddresses=${joyTokenAddres}&apikey=${process.env.POLYGON_SCAN_API_KEY}`;
  const requestAddressCrowdsale = `https://api.polygonscan.com/api?module=contract&action=getcontractcreation&contractaddresses=${joyCrowdsaleAddress}&apikey=${process.env.POLYGON_SCAN_API_KEY}&constructorArguements=${encodArgs}`;

  const response = await fetch(requestAddressTokenJoy, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response2 = await fetch(requestAddressCrowdsale, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("response", response.status);
  console.log("response2", response2.status);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
