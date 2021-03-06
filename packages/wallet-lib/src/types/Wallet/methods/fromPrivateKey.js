const { is } = require('../../../utils');
const KeyChain = require('../../KeyChain/KeyChain');
const { WALLET_TYPES } = require('../../../CONSTANTS');

/**
 * Will set a wallet to work with a mnemonic (keychain, walletType & HDPrivateKey)
 * @param privateKey
 */
module.exports = function fromPrivateKey(privateKey) {
  if (!is.privateKey(privateKey)) throw new Error('Expected a valid private key (typeof PrivateKey or String)');
  this.walletType = WALLET_TYPES.PRIVATEKEY;
  this.mnemonic = null;
  this.privateKey = privateKey;
  this.keyChain = new KeyChain({ privateKey });
};
