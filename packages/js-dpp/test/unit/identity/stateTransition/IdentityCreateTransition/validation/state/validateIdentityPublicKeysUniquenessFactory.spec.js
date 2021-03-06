const validateIdentityPublicKeyUniquenessFactory = require(
  '../../../../../../../lib/identity/stateTransition/IdentityCreateTransition/validation/state/validateIdentityPublicKeysUniquenessFactory',
);

const IdentityPublicKeyAlreadyExistsError = require(
  '../../../../../../../lib/errors/consensus/state/identity/IdentityPublicKeyAlreadyExistsError',
);

const getIdentityFixture = require('../../../../../../../lib/test/fixtures/getIdentityFixture');
const createStateRepositoryMock = require('../../../../../../../lib/test/mocks/createStateRepositoryMock');

const { expectValidationError } = require(
  '../../../../../../../lib/test/expect/expectError',
);

describe('validateIdentityPublicKeysUniquenessFactory', () => {
  let identity;
  let stateRepositoryMock;
  let validateIdentityPublicKeyUniqueness;

  beforeEach(function beforeEach() {
    identity = getIdentityFixture();

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);

    stateRepositoryMock.fetchIdentityIdsByPublicKeyHashes.resolves([]);

    validateIdentityPublicKeyUniqueness = validateIdentityPublicKeyUniquenessFactory(
      stateRepositoryMock,
    );
  });

  it('should return invalid result if identity id was found', async () => {
    const publicKeys = identity.getPublicKeys();

    stateRepositoryMock.fetchIdentityIdsByPublicKeyHashes.resolves([
      identity.getId(),
    ]);

    const result = await validateIdentityPublicKeyUniqueness(
      publicKeys,
    );

    expectValidationError(result, IdentityPublicKeyAlreadyExistsError);

    const [error] = result.getErrors();

    expect(error.getCode()).to.equal(4012);
    expect(error.getPublicKeyHash()).to.deep.equal(identity.getPublicKeyById(0).hash());
  });

  it('should return valid result if no identity id was not found', async () => {
    const result = await validateIdentityPublicKeyUniqueness(
      identity.getPublicKeys(),
    );

    expect(result.isValid()).to.be.true();
  });
});
