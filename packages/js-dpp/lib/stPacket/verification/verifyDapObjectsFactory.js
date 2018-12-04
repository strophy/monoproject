const DapObject = require('../../dapObject/DapObject');

const VerificationResult = require('./VerificationResult');
const ConsensusError = require('../../errors/ConsensusError');

/**
 * @return {verifyDapObjects}
 */
function verifyDapObjectsFactory() {
  /**
   * @typedef verifyDapObjects
   * @param {STPacket} stPacket
   * @param {AbstractDataProvider} dataProvider
   * @return {Promise<VerificationResult>}
   */
  async function verifyDapObjects(stPacket, dataProvider) {
    const result = new VerificationResult();

    // eslint-disable-next-line
    const primaryKeysAndTypes = stPacket.getDapObjects().map((dapObject) => {
      return {
        dapContractId: stPacket.getDapContractId(),
        type: dapObject.getType(),
        primaryKey: dapObject.getPrimaryKey(),
      };
    });

    const fetchedDapObjects = await dataProvider.fetchDapObjects(primaryKeysAndTypes);

    stPacket.getDapObjects().forEach((dapObject) => {
      // eslint-disable-next-line arrow-body-style
      const fetchedDapObject = fetchedDapObjects.find((object) => {
        return dapObject.getType() === object.getType()
          && dapObject.getPrimaryKey() === object.getPrimaryKey();
      });

      const dapObjectSchema = stPacket.getDapContract().getDapObjectSchema(dapObject.getType());
      if (dapObjectSchema.primaryKey && dapObjectSchema.primaryKey.composite) {
        // TODO: Recreate ID and compare
      }

      switch (dapObject.getAction()) {
        case DapObject.ACTIONS.CREATE:
          if (fetchedDapObject) {
            result.addError(new ConsensusError('Dap Object with the same primary key already created'));
          }
          break;
        case DapObject.ACTIONS.UPDATE:
        case DapObject.ACTIONS.DELETE:
          if (!fetchedDapObject) {
            result.addError(new ConsensusError('Dap Object is not present'));

            break;
          }

          // TODO: Verify owner

          if (dapObject.getRevision() !== fetchedDapObject.getRevision() + 1) {
            result.addError(new ConsensusError('Invalid Dap Object revision'));
          }

          break;
        default:
          result.addError(new ConsensusError('Invalid Dap Object action'));

          break;
      }
    });

    return result;
  }

  return verifyDapObjects;
}

module.exports = verifyDapObjectsFactory;
