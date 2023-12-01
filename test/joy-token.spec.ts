import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractTransactionResponse } from "ethers";
import { Crowdsale, Joy } from "../typechain-types";

describe("Joy", function () {
  async function deployOneYearLockFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Joy = await ethers.getContractFactory("Joy");
    const joy = await Joy.deploy();

    const CrowdSale = await ethers.getContractFactory("Crowdsale");

    const crowdsale = await CrowdSale.deploy(
        1,
        owner.address,
        joy.getAddress(),
        1000000000,
        1000000000000
    );

    return { joyCrowdSale: crowdsale, joy, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should have a name, symbol, and decimals", async function () {
      const { joy } = await loadFixture(deployOneYearLockFixture);

      const name = await joy.name();
      const symbol = await joy.symbol();
      const decimals = await joy.decimals();

      expect(name).to.not.be.empty;
      expect(symbol).to.not.be.empty;
      expect(decimals).to.equal(18);
    });

    it("Should mint and transfer tokens correctly", async function () {
      const { joy, owner } = await loadFixture(deployOneYearLockFixture);

      const initialBalance = await joy.balanceOf(owner.address);
      const transferAmount = ethers.parseEther("100");

      await joy.connect(owner).mint(owner.address, transferAmount);
      const newBalance = await joy.balanceOf(owner.address);

      // Convert initialBalance to BigInt using BigInt()
      const initialBalanceBigInt = BigInt(initialBalance);

      // Perform the addition using BigInt
      const expectedBalance = initialBalanceBigInt + BigInt(transferAmount.toString());

      // Use toString() to compare the values
      expect(newBalance.toString()).to.equal(expectedBalance.toString());

    });

    it("Should transfer tokens between accounts", async function () {
      const { joy, owner, otherAccount } = await loadFixture(deployOneYearLockFixture);

      const senderBalanceBefore = await joy.balanceOf(owner.address);
      const recipientBalanceBefore = await joy.balanceOf(otherAccount.address);

      const transferAmount = ethers.parseEther("50");
      await joy.connect(owner).transfer(otherAccount.address, transferAmount);

      const senderBalanceAfter = await joy.balanceOf(owner.address);
      const recipientBalanceAfter = await joy.balanceOf(otherAccount.address);

      // Convert balances to BigInt for comparison
      const senderBalanceBeforeBigInt = BigInt(senderBalanceBefore.toString());
      const recipientBalanceBeforeBigInt = BigInt(recipientBalanceBefore.toString());
      const transferAmountBigInt = BigInt(transferAmount.toString());

      expect(senderBalanceAfter.toString()).to.equal((senderBalanceBeforeBigInt - transferAmountBigInt).toString());
      expect(recipientBalanceAfter.toString()).to.equal((recipientBalanceBeforeBigInt + transferAmountBigInt).toString());
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
