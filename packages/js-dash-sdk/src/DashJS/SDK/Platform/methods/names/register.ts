import {Platform} from "../../Platform";
const entropy = require('@dashevo/dpp/lib/util/entropy');
const { hash } = require('@dashevo/dpp/lib/util/multihashDoubleSHA256');
const bs58 = require('bs58');

export async function register(this: Platform,
                               name: string,
                               identity: {
                                    id: any;
                                    type: number,
                                   publicKeys: [any]
                                   getPublicKeyById(number: number):any;
                               }
): Promise<any> {
    const {account, client,dpp } = this;

    // @ts-ignore
    const identityHDPrivateKey = account.getIdentityHDKey(0, 'user');

    // @ts-ignore
    const identityPrivateKey = identityHDPrivateKey.privateKey;

    const records = {dashIdentity: identity.id};

    const normalizedParentDomainName = `dash`;
    const label = name;
    const normalizedLabel = label.toLowerCase();
    const fullDomainName = `${normalizedLabel}.${normalizedParentDomainName}`;

    const nameHash = hash(
        Buffer.from(fullDomainName),
    ).toString('hex');

    const preorderSalt = entropy.generate();

    const saltedDomainHashBuffer = Buffer.concat([
        bs58.decode(preorderSalt),
        Buffer.from(nameHash, 'hex'),
    ]);

    const saltedDomainHash = hash(
        saltedDomainHashBuffer,
    ).toString('hex');

    if(!this.apps.dpns.contractId){
        throw new Error('DPNS is required to register a new name.');
    }
    const dataContract = await this.contracts.get(this.apps.dpns.contractId);
    if(!dataContract){
        throw new Error('DPNS Contract not loaded. Cannot register.');
    }
    // 1. Create preorder document
    const preorderDocument = dpp.document.create(
        dataContract,
        identity.id,
        'preorder',
        {
            saltedDomainHash,
        },
    );

    const preorderTransition = dpp.document.createStateTransition([preorderDocument]);
    preorderTransition.sign(identity.getPublicKeyById(1), identityPrivateKey);

    // @ts-ignore
    await client.applyStateTransition(preorderTransition);

    // 3. Create domain document
    const domainDocument = dpp.document.create(
        dataContract,
        identity.id,
        'domain',
        {
            nameHash,
            label,
            normalizedLabel,
            normalizedParentDomainName,
            preorderSalt,
            records,
        },
    );

    console.dir({domainDocument})

    // 4. Create and send domain state transition
    const domainTransition = dpp.document.createStateTransition([domainDocument]);
    domainTransition.sign(identity.getPublicKeyById(1), identityPrivateKey);

    console.dir({domainTransition}, {depth:10})

    // @ts-ignore
    await client.applyStateTransition(domainTransition);

    return domainDocument;

}

export default register;
