import * as nearAPI from 'near-api-js';


// Initializing contract
async function initContract() {
  const nearConfig = {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    contractName: 'thanks.humanman.testnet',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org'
  };

  // Initializing connection to the NEAR TestNet
  const near = await nearAPI.connect({
    deps: {
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore()
    },
    ...nearConfig
  });

  // Needed to access wallet
  const walletConnection = new nearAPI.WalletConnection(near);

  // Load in account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      accountId: walletConnection.getAccountId(),
      balance: (await walletConnection.account().state()).amount
    };
  }

  // Initializing our contract APIs by contract name and configuration
  const contract = await new nearAPI.Contract(walletConnection.account(), nearConfig.contractName, {
    // View methods are read-only – they don't modify the state, but usually return some value
    // viewMethods: ['getMessages'],
    // Change methods can modify the state, but you don't receive the returned value when called
    changeMethods: ['say'],
    // Sender is the account ID to initialize transactions.
    // getAccountId() will return empty string if user is still unauthorized
    sender: walletConnection.getAccountId()
  });

  return { contract, currentUser, nearConfig, walletConnection };
}

export default initContract
