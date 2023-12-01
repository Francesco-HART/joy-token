import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
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
    const [owner, otherAccount] = await ethers.getSigners();

    const Joy = await ethers.getContractFactory("Joy");
    const joy = await Joy.deploy();

    const CrowdSale = await ethers.getContractFactory("Crowdsale");

    const crowdsale = await CrowdSale.deploy(
        1,
        owner.address,
        joy.getAddress(),
        1000000000,
        10000000000000
    );

    return { joyCrowdSale: crowdsale, joy, owner, otherAccount };
  }

  describe("Crowdsale Joy buyTokens", function () {
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
      connectingCrowdsaleContract.buyTokens(otherAccount, {
        value: 10,
      });

      // then
      expect(await connectingJoyContract.balanceOf(otherAccount)).to.be.equal(
          0
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