import "./Joy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Crowdsale is Ownable {
    // using SafeMath for uint256;

    Joy public token;
    uint256 public rate; // Number of tokens per Ether
    uint256 public cap; // Maximum amount to be raised
    uint256 public raisedAmount; // Amount of Ether raised
    uint256 public purchasedTokens; // Amount of Ether raised
    uint256 public closingTime;
    bool public isClosed = false;

    event TokensPurchased(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

    modifier onlyWhileOpen() {
        require(
            block.timestamp <= closingTime && !isClosed,
            "Crowdsale: closed"
        );
        _;
    }

    constructor(
        uint256 _rate,
        address payable wallet,
        Joy _token,
        uint256 _cap,
        uint256 _closingTime
    ) Ownable(msg.sender) {
        require(_rate > 0, "Crowdsale: rate is 0");
        require(wallet != address(0), "Crowdsale: wallet is the zero address");
        require(
            address(_token) != address(0),
            "Crowdsale: token is the zero address"
        );
        require(_cap > 0, "Crowdsale: cap is 0");
        require(
            _closingTime > block.timestamp,
            "Crowdsale: closing time is in the past"
        );

        rate = _rate;
        cap = _cap;
        closingTime = _closingTime;
        token = _token;
        transferOwnership(wallet);
    }

    receive() external payable {
        buyTokens(msg.sender);
    }

    function buyTokens(address beneficiary) public payable {
        require(
            beneficiary != address(0),
            "Crowdsale: beneficiary is the zero address"
        );
        uint256 weiAmount = msg.value;
        uint256 tokensAmount = weiAmount * rate;
        //require(raisedAmount + weiAmount <= cap, "Crowdsale: cap exceeded");
        require(purchasedTokens + tokensAmount <= cap, "Crowdsale: cap exceeded");
        raisedAmount = raisedAmount + weiAmount;
        purchasedTokens = purchasedTokens + tokensAmount;
        token.transfer(beneficiary, tokensAmount);
        emit TokensPurchased(msg.sender, beneficiary, weiAmount, tokensAmount);
    }

    function closeCrowdsale() external onlyOwner onlyWhileOpen {
        isClosed = true;
    }

    function claimUnsoldTokens() external onlyOwner {
        require(isClosed, "Crowdsale: not closed");
        uint256 unsoldTokens = token.balanceOf(address(this));
        token.transfer(owner(), unsoldTokens);
    }

    function claimCollectedEther() external onlyOwner {
        require(isClosed, "Crowdsale: not closed");
        payable(owner()).transfer(address(this).balance);
    }

    function getRaisedAmount() public view returns (uint){
        return raisedAmount;
    }
}
