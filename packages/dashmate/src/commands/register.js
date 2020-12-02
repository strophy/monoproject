const { Listr } = require('listr2');

const { flags: flagTypes } = require('@oclif/command');

const { PrivateKey } = require('@dashevo/dashcore-lib');

const BaseCommand = require('../oclif/command/BaseCommand');
const MuteOneLineError = require('../oclif/errors/MuteOneLineError');

const masternodeDashAmount = require('../core/masternodeDashAmount');

class RegisterCommand extends BaseCommand {
  /**
   * @param {Object} args
   * @param {Object} flags
   * @param {registerMasternodeTask} registerMasternodeTask
   * @param {Config} config
   * @return {Promise<void>}
   */
  async runWithDependencies(
    {
      'funding-private-key': fundingPrivateKeyString,
    },
    {
      verbose: isVerbose,
    },
    registerMasternodeTask,
    config,
  ) {
    const network = config.get('network');

    const fundingPrivateKey = new PrivateKey(
      fundingPrivateKeyString,
      network,
    );

    const fundingAddress = fundingPrivateKey.toAddress(network).toString();

    const tasks = new Listr([
      {
        title: 'Register masternode',
        task: () => registerMasternodeTask(config),
      },
    ],
    {
      renderer: isVerbose ? 'verbose' : 'default',
      rendererOptions: {
        clearOutput: false,
        collapse: false,
        showSubtasks: true,
      },
    });

    try {
      await tasks.run({
        fundingAddress,
        fundingPrivateKeyString,
      });
    } catch (e) {
      throw new MuteOneLineError(e);
    }
  }
}

RegisterCommand.description = `Register masternode

Register masternode and set operator private key in config
`;

RegisterCommand.args = [{
  name: 'funding-private-key',
  required: true,
  description: `private key with more than ${masternodeDashAmount} dash for funding collateral`,
}];

RegisterCommand.flags = {
  ...BaseCommand.flags,
  verbose: flagTypes.boolean({ char: 'v', description: 'use verbose mode for output', default: false }),
};

module.exports = RegisterCommand;
