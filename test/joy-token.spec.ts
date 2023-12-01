import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractTransactionResponse } from "ethers";
import { Crowdsale, Joy } from "../typechain-types";

describe("Joy", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Joy = await ethers.getContractFactory("Joy");
    const joy = await Joy.deploy();

    const JoyCrowdsale = await ethers.getContractFactory("Crowdsale");

    const joyCrowdSale = await JoyCrowdsale.deploy(
      1,
      owner.address,
      joy,
      1000000000000000000000000000,
      1000000000000000000000000000
    );

    return { joyCrowdSale, joy, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should have a name, symbol, and decimals", async function () {
      const { joy, owner } = await loadFixture(deployOneYearLockFixture);

      const name = await joy.name();
      const symbol = await joy.symbol();
      const decimals = await joy.decimals();

      expect(name).to.not.be.empty;
      expect(symbol).to.not.be.empty;
      expect(decimals).to.be.equal(18); // Adjust if your token has a different number of decimals
    });

    it("Should mint and transfer tokens correctly", async function () {
      const { joy, owner } = await loadFixture(deployOneYearLockFixture);

      const initialBalance = await joy.balanceOf(owner.address);
      const transferAmount = ethers.parseEther("100");

      await joy.connect(owner).mint(owner.address, transferAmount);
      const newBalance = await joy.balanceOf(owner.address);

      expect(newBalance).to.be.equal(initialBalance + transferAmount);
    });

    it("Should transfer tokens between accounts", async function () {
      const { joy, owner, otherAccount } = await loadFixture(
        deployOneYearLockFixture
      );

      const senderBalanceBefore = await joy.balanceOf(owner.address);
      const recipientBalanceBefore = await joy.balanceOf(otherAccount.address);

      const transferAmount = ethers.parseEther("50");
      await joy.connect(owner).transfer(otherAccount.address, transferAmount);

      const senderBalanceAfter = await joy.balanceOf(owner.address);
      const recipientBalanceAfter = await joy.balanceOf(otherAccount.address);

      expect(senderBalanceAfter).to.be.equal(
        senderBalanceBefore - transferAmount
      );
      expect(recipientBalanceAfter).to.be.equal(
        recipientBalanceBefore + transferAmount
      );
    });
  });

  const connectToCrowdsale = async (
    crowdsale: CrowdsaleContract,
    owner: SignerWithAddress
  ): Promise<Crowdsale> => crowdsale.connect(owner);

  const connectToJoy = async (
    joy: JoysaleContract,
    owner: SignerWithAddress
  ): Promise<Joy> => joy.connect(owner);

  type CrowdsaleContract = Crowdsale & {
    deploymentTransaction(): ContractTransactionResponse;
  };

  type JoysaleContract = Joy & {
    deploymentTransaction(): ContractTransactionResponse;
  };
});
