import {PublicKey, PrivateKey, Transaction} from "@dashevo/dashcore-lib";
// @ts-ignore
import {utils} from "@dashevo/wallet-lib";

const Identity = require('@dashevo/dpp/lib/identity/Identity');
const stateTransitionTypes = require('@dashevo/dpp/lib/stateTransition/stateTransitionTypes');
const IdentityPublicKey = require('@dashevo/dpp/lib/identity/IdentityPublicKey');
const IdentityCreateTransition = require('@dashevo/dpp/lib/identity/stateTransitions/identityCreateTransition/IdentityCreateTransition');

import {Platform} from "../../Platform";

export async function register(this: Platform, identityType: string = 'USER'): Promise<any> {
    const { account } = this;

    const burnAmount = 10000;

    if (!Identity.TYPES[identityType.toUpperCase()]) {
        throw new Error(`Create identity of ${identityType}. Wrong type. Expected one of ${Object.keys(Identity.TYPES)}`);
    }

    if (account === undefined) {
        throw new Error(`A initialized wallet is required to create an Identity.`);
    }
    const hardenedFeatureRootKey = account.keyChain.getHardenedDIP9FeaturePath();

    // Feature 5 : identity.
    const identityFeatureKey = hardenedFeatureRootKey.deriveChild(5, true);

    const identityHDPrivateKey = identityFeatureKey
        // @ts-ignore
        .deriveChild(account.index, true)
        // @ts-ignore
        .deriveChild(Identity.TYPES[identityType.toUpperCase()], false)
        // @ts-ignore
        .deriveChild(0, false);

    const identityPrivateKey = identityHDPrivateKey.privateKey;
    const identityPublicKey = identityHDPrivateKey.publicKey;

    const identityAddress = identityPublicKey.toAddress().toString();
    const changeAddress = account.getUnusedAddress('internal').address;
    console.log('Identity Public Key', identityPublicKey.toString());
    console.log('Identity Public Address', identityAddress);

    let selection;
    try {
        // @ts-ignore
        const lockTransaction = new Transaction();

        const output = {
            satoshis: burnAmount,
            address: identityAddress
        };

        const utxos = account.getUTXOS();
        const balance = account.getConfirmedBalance();

        if (balance < output.satoshis) {
            throw new Error(`Not enought balance (${balance}) to cover burn amount of ${burnAmount}`)
        }

        selection = utils.coinSelection(utxos, [output]);

        // FIXME : Usage with a single utxo had estimated fee of 205.
        // But network failed us with 66: min relay fee not met.
        // Over-writing the value for now.
        selection.estimatedFee = 680;

        lockTransaction
            .from(selection.utxos)
            .addBurnOutput(output.satoshis, identityPublicKey._getID())
            // @ts-ignore
            .change(changeAddress)
            .fee(selection.estimatedFee)

        const UTXOHDPrivateKey = account.getPrivateKeys(selection.utxos.map((utxo: any) => utxo.address));

        // @ts-ignore
        const signingKeys = UTXOHDPrivateKey.map((hdprivateKey) => hdprivateKey.privateKey);

        // @ts-ignore
        // FIXME : Seems to fail with addBurnOutput ?
        // const signedLockTransaction = account.sign(lockTransaction, signingKeys);
        const signedLockTransaction = lockTransaction.sign(signingKeys);
        // @ts-ignore
        const txId = await account.broadcastTransaction(signedLockTransaction.serialize());

        // @ts-ignore
        const outPoint = signedLockTransaction.getOutPointBuffer(0).toString('base64');

        // FIXME
        const publicKeyId = 1;

        const identityPublicKeyModel = new IdentityPublicKey()
            .setId(publicKeyId)
            .setType(IdentityPublicKey.TYPES.ECDSA_SECP256K1)
            .setData(identityPublicKey.toBuffer().toString('base64'));

        const identityCreateTransition = new IdentityCreateTransition({
            protocolVersion: 0,
            type: stateTransitionTypes.IDENTITY_CREATE,
            lockedOutPoint: outPoint,
            identityType: Identity.TYPES[identityType.toUpperCase()],
            publicKeys: [
                identityPublicKeyModel.toJSON(),
            ],
        });

        // FIXME : Need dpp to be a dependency of wallet-lib to deal with signing IdentityPublicKey (validation)
        // account.sign(identityPublicKeyModel, identityPrivateKey);
        identityCreateTransition.sign(identityPublicKeyModel, identityPrivateKey);

        // @ts-ignore
        return identityCreateTransition.getIdentityId();
    } catch (e) {
        throw e
    }
}

export default register;
