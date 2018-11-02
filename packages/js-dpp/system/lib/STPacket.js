/**
 * @class STPacket
 * @property {string} dapContractId
 * @property Array<Object> dapContracts
 * @property Array<Object> dapObjects
 */
class STPacket {
  constructor() {
    this.dapContractId = '';
    this.dapObjects = [];
    this.dapContracts = [];
  }

  /**
   * @param {DapContract} dapContract
   */
  setDapContract(dapContract) {
    this.dapContracts = [dapContract];
    // TODO: set contract id
    // this.dapContractId = toHash(dapContract);
  }

  /**
   * @template TDapObject {Object}
   * @param {Array<TDapObject>} dapObjects
   */
  setDapObjects(dapObjects) {
    this.dapObjects = dapObjects;
  }

  /**
   * @template TDapObject {Object}
   * @param {Array<TDapObject>} dapObjects
   */
  addDapObject(dapObjects) {
    this.dapObjects.push(...dapObjects);
  }

  /**
   * @param {string} dapContractId
   */
  setDapContractId(dapContractId) {
    this.dapContractId = dapContractId;
  }

  /**
   * @return {{dapContractId: string, dapContracts: Array<Object>, dapObjects: Array<Object>}}
   */
  toJson() {
    return {
      dapContractId: this.dapContractId,
      dapContracts: this.dapContracts,
      dapObjects: this.dapObjects,
    };
  }
}

module.exports = STPacket;
