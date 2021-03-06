const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const createWallet = require('./createWallet');
const createChain = require('./createChain');

describe('Storage - createWallet', function suite() {
  this.timeout(10000);
  it('should create a wallet', () => {
    const self = {
      store: { wallets: {}, chains: {} },
      createChain,
    };
    const walletid = '123ae';

    createWallet.call(self, walletid);

    const expected = {
      wallets: {
        '123ae': {
          accounts: {},
          network: Dashcore.Networks.testnet.toString(),
          mnemonic: null,
          type: null,
          identityIds: [],
          addresses: { external: {}, internal: {}, misc: {} },
        },
      },
      chains: {
        testnet: {
          name: 'testnet',
          blockHeight: -1,
          blockHeaders: {},
          mappedBlockHeaderHeights: {},
          fees: {
            minRelay: -1
          }
        },
      },
    };
    expect(self.store).to.be.deep.equal(expected);
  });
  it('should create a wallet without any walletId', () => {
    const self = {
      store: { wallets: {}, chains: {} },
      createChain,
    };

    createWallet.call(self);

    const expected = {
      wallets: {
        squawk7700: {
          accounts: {},
          network: Dashcore.Networks.testnet.toString(),
          mnemonic: null,
          type: null,
          identityIds: [],
          addresses: { external: {}, internal: {}, misc: {} },
        },
      },
      chains: {
        testnet: {
          name: 'testnet',
          blockHeight: -1,
          blockHeaders: {},
          mappedBlockHeaderHeights: {},
          fees: {
            minRelay: -1
          }
        },
      },
    };
    expect(self.store).to.be.deep.equal(expected);
  });
});
