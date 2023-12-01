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
    const zeroAddress = '0x0000000000000000000000000000000000000000';

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

    await joy.transfer(await joyCrowdSale.getAddress(), 1000000000/2);
    await joy.transfer(owner.getAddress(), 1000000000/2);

    return { joyCrowdSale, joy, owner, otherAccount, zeroAddress };
  }

  describe.only("Crowdsale Joy buyTokens", function () {
    it("Should buy tokens correctly", async function () {
      // given
      const { joy, joyCrowdSale, owner, otherAccount } = await loadFixture(
        deployOneYearLockFixture
      );

      const connectingCrowdsaleContract = await connectToCrowdsale(
        joyCrowdSale,
        owner
      );
      const connectingJoyContract = await connectToJoy(joy, owner);
      await connectingCrowdsaleContract.buyTokens(otherAccount.address, {
        value: 10,
      });

      // then
      expect(await connectingJoyContract.balanceOf(otherAccount.address)).to.be.equal(
        10
      );
    });

    it("Should not buy tokens if go over cap", async function () {
      // given
      const { joy, joyCrowdSale, owner, otherAccount } = await loadFixture(
        deployOneYearLockFixture
      );

      const connectingCrowdsaleContract = await connectToCrowdsale(
        joyCrowdSale,
        owner
      );
      const connectingJoyContract = await connectToJoy(joy, owner);
      await connectingCrowdsaleContract.buyTokens(otherAccount, {
        value: 10,
      });

      // then
      await expect(connectingCrowdsaleContract.buyTokens(otherAccount.address, {
        value: 999999999999999,
      })).to.be.revertedWith("Crowdsale: cap exceeded");
    });

    it("Should not buy tokens to 0 address", async function () {
      // given
      const { joy, joyCrowdSale, owner, otherAccount,zeroAddress } = await loadFixture(
        deployOneYearLockFixture
      );

      const connectingCrowdsaleContract = await connectToCrowdsale(
        joyCrowdSale,
        owner
      );
      const connectingJoyContract = await connectToJoy(joy, owner);

      // then
      await expect(connectingCrowdsaleContract.buyTokens(zeroAddress, {
        value: 1,
      })).to.be.revertedWith("Crowdsale: beneficiary is the zero address");
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
