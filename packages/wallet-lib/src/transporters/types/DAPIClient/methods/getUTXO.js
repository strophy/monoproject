const { is } = require('../../../../utils');
const logger = require('../../../../logger');

module.exports = async function getUTXO(address) {
  logger.silly(`DAPIClient.getUTXO[${address}]`);
  if (!is.address(address) && !is.arr(address)) throw new Error('Received an invalid address to fetch');
  return this.client.getUTXO(address);
};
