const { PublicKey } = require('@dashevo/dashcore-lib');

const ValidationResult = require('../../validation/ValidationResult');

const convertBuffersToArrays = require('../../util/convertBuffersToArrays');

const publicKeySchema = require('../../../schema/identity/publicKey.json');

const InvalidIdentityPublicKeyDataError = require(
  '../../errors/consensus/basic/identity/InvalidIdentityPublicKeyDataError',
);

const DuplicatedIdentityPublicKeyError = require(
  '../../errors/consensus/basic/identity/DuplicatedIdentityPublicKeyError',
);
const DuplicatedIdentityPublicKeyIdError = require(
  '../../errors/consensus/basic/identity/DuplicatedIdentityPublicKeyIdError',
);

/**
 * Validate public keys (factory)
 *
 * @param {JsonSchemaValidator} validator
 *
 * @return {validatePublicKeys}
 */
function validatePublicKeysFactory(validator) {
  /**
   * Validate public keys
   *
   * @typedef validatePublicKeys
   *
   * @param {RawIdentityPublicKey[]} rawPublicKeys
   *
   * @return {ValidationResult}
   */
  function validatePublicKeys(rawPublicKeys) {
    const result = new ValidationResult();

    // Validate public key structure
    rawPublicKeys.forEach((rawPublicKey) => {
      result.merge(
        validator.validate(
          publicKeySchema,
          convertBuffersToArrays(rawPublicKey),
        ),
      );
    });

    if (!result.isValid()) {
      return result;
    }

    // Check that there's no duplicated key ids in the state transition
    const duplicatedIds = [];
    const idsCount = {};

    rawPublicKeys.forEach((rawPublicKey) => {
      idsCount[rawPublicKey.id] = !idsCount[rawPublicKey.id] ? 1 : idsCount[rawPublicKey.id] + 1;
      if (idsCount[rawPublicKey.id] > 1) {
        duplicatedIds.push(rawPublicKey.id);
      }
    });

    if (duplicatedIds.length > 0) {
      result.addError(
        new DuplicatedIdentityPublicKeyIdError(duplicatedIds),
      );
    }

    // Check that there's no duplicated keys
    const keysCount = {};
    const duplicatedKeyIds = [];
    rawPublicKeys.forEach((rawPublicKey) => {
      const dataHex = rawPublicKey.data.toString('hex');

      keysCount[dataHex] = !keysCount[dataHex]
        ? 1 : keysCount[dataHex] + 1;

      if (keysCount[dataHex] > 1) {
        duplicatedKeyIds.push(rawPublicKey.id);
      }
    });

    if (duplicatedKeyIds.length > 0) {
      result.addError(
        new DuplicatedIdentityPublicKeyError(duplicatedKeyIds),
      );
    }

    // validate key data
    rawPublicKeys
      .forEach((rawPublicKey) => {
        const dataHex = rawPublicKey.data.toString('hex');

        if (!PublicKey.isValid(dataHex)) {
          const validationError = PublicKey.getValidationError(dataHex);

          const consensusError = new InvalidIdentityPublicKeyDataError(
            rawPublicKey.id,
            validationError.message,
          );

          consensusError.setValidationError(validationError);

          result.addError(consensusError);
        }
      });

    return result;
  }

  return validatePublicKeys;
}

module.exports = validatePublicKeysFactory;
