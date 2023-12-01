// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Joy is ERC20, Ownable {
    constructor() ERC20("Joy", "JOY") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Adjust the initial supply as needed
        transferOwnership(msg.sender);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
