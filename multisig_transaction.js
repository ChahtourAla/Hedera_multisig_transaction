console.clear();
const {
  Client,
  AccountId,
  AccountBalanceQuery,
  TransferTransaction,
  PrivateKey,
} = require("@hashgraph/sdk");
require("dotenv").config();

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const myPrivateKey = PrivateKey.fromStringDer(process.env.MY_PRIVATE_KEY);
const secondAccountId = process.env.SECOND_ACCOUNT_ID;
const secondPrivateKey = PrivateKey.fromStringDer(
  process.env.SECOND_PRIVATE_KEY
);

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();

// Set the operator account ID and operator private key
client.setOperator(myAccountId, myPrivateKey);

async function transferHbar(amount) {
  const transferTransaction = new TransferTransaction()
    .addHbarTransfer(myAccountId, -amount)
    .addHbarTransfer(secondAccountId, -amount)
    .addHbarTransfer("0.0.6768809", amount * 2)
    .freezeWith(client);

  const signedTx = await (
    await transferTransaction.sign(myPrivateKey)
  ).sign(secondPrivateKey);

  const result = await signedTx.execute(client);
  const receipt = await result.getReceipt(client);

  console.log("Transfer ", receipt.status.toString());
}

async function queryBalance(accountId) {
  //Query account balance
  const accountBalanace = await new AccountBalanceQuery().setAccountId(
    accountId
  );
  const result = await accountBalanace.execute(client);
  console.log(accountId + " current hbar :", result.hbars.toString());
}

async function main() {
  await queryBalance(myAccountId);
  await queryBalance(secondAccountId);
  await queryBalance("0.0.6768809");
  await transferHbar(2);
  await queryBalance(myAccountId);
  await queryBalance(secondAccountId);
  await queryBalance("0.0.6768809");
}
main();
