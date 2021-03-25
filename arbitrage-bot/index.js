const Web3 = require("web3");
const BigNumber = require("bignumber.js");
const oneSplitAbi = require("./abis/1splitabi.json");
const erc20Abi = require("./abis/erc20abi.json");
const DexesList = require("./exchangesList");
const ethWeiDecimals = 18;
const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");

var web3 = new Web3(provider);

var fromAddress = "0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c";
var toTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // Eth
var fromTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // Dai
var oneSplitAddress = "0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E";
var amountToSwap = 1690;
var amountToSwapWei = new BigNumber(amountToSwap).shiftedBy(ethWeiDecimals);
var expectedSwap = null;

var OneSplitContract = new web3.eth.Contract(oneSplitAbi, oneSplitAddress);
var DaiContract = new web3.eth.Contract(erc20Abi, fromTokenAddress);

async function getExpectedReturn() {
  await OneSplitContract.methods
    .getExpectedReturn(
      fromTokenAddress,
      toTokenAddress,
      new BigNumber(amountToSwap).shiftedBy(ethWeiDecimals),
      100,
      0
    )
    .call({}, async (err, res) => {
      if (err) console.error(err);
      expectedSwap = res;
      console.log(`
        from: ${fromTokenAddress}
        to: ${toTokenAddress}
        amount: ${amountToSwap}
        returnAmount: ${new BigNumber(res.returnAmount)
          .shiftedBy(-ethWeiDecimals)
          .toString()}
    `);
      DexesList.forEach((dex, i) => {
        console.log(`${dex}: ${res.distribution[i]}%`);
      });
      await approveSpender();
    });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function awaitTransaction(tx) {
  var receipt = null;
  do {
    await web3.eth.getTransactionReceipt(tx).then(res => {
      if (res) receipt = res;
      wait(2000);
    });
  } while (receipt === null);
  console.log(`Transactions went successfull: ${receipt.transactioHash}`);
  return receipt.status;
}

async function approveSpender() {
  await DaiContract.methods
    .approve(oneSplitAddress, amountToSwapWei)
    .send({ from: fromAddress }, async (err, tx) => {
      if (err) console.log(`ERC20 token approving failed: ${err}`);
      console.log(`ERC20 token approved to: ${oneSplitAddress}`);
      await awaitTransaction(tx);
      await executeSwap();
    });
}

function fromWeiConvertor(amount) {
  return new BigNumber(amount).shiftedBy(-ethWeiDecimals).toFixed(2);
}

async function executeSwap() {
  // eth and dai balances before the swap
  var ethBefore = await web3.eth.getBalance(fromAddress);
  var daiBefore = await DaiContract.methods.balanceOf(fromAddress).call();

  await OneSplitContract.methods
    .swap(
      fromTokenAddress,
      toTokenAddress,
      amountToSwapWei,
      expectedSwap.returnAmount,
      expectedSwap.distribution,
      0
    )
    .send({ from: fromAddress, gas: 9999999 }, async (err, tx) => {
      if (err) console.log(`The swap couldn't be executed: ${err}`);
      await awaitTransaction(tx);
      // eth & dai balances after the swap
      var ethAfter = await web3.eth.getBalance(fromAddress);
      var daiAfter = await DaiContract.methods.balanceOf(fromAddress).call();

      console.log(`
            The swap went successfull.
            
            Balances before: ${fromWeiConvertor(
              ethBefore
            )} - ${fromWeiConvertor(daiBefore)}
            Balances after: ${fromWeiConvertor(ethAfter)} - ${fromWeiConvertor(
        daiAfter
      )}`);
    });
}

getExpectedReturn();
