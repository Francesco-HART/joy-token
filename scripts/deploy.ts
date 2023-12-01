import { ethers } from "hardhat";

async function main() {
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

  const JoyCrowdsale = await ethers.getContractFactory("Crowdsale");
  const joyCrowdSale = await JoyCrowdsale.deploy(
      1,
      owner.address,
      await joy.getAddress(),
      1000000000,
      10000000000000
  );

  await joy.transfer(await joyCrowdSale.getAddress(), 10000);
  //await joy.waitForDeployment();

  console.log(
    `Lock with ${ethers.formatEther(
      lockedAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${joy.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
