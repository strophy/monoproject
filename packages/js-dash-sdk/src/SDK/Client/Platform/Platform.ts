// @ts-ignore
import DashPlatformProtocol from "@dashevo/dpp";

import Client, { ClientApps } from "../Client";

import broadcastDocument from "./methods/documents/broadcast";
import createDocument from "./methods/documents/create";
import getDocument from "./methods/documents/get";

import broadcastContract from "./methods/contracts/broadcast";
import createContract from "./methods/contracts/create";
import getContract from "./methods/contracts/get";

import getIdentity from "./methods/identities/get";
import registerIdentity from "./methods/identities/register";
import topUpIdentity from "./methods/identities/topUp";

import getName from "./methods/names/get";
import registerName from "./methods/names/register";

/**
 * Interface for PlatformOpts
 *
 * @remarks
 * required parameters include { client, apps }
 * optional parameters include { ..., account?, network? }
 */
export interface PlatformOpts {
    client: Client,
    apps: ClientApps
    network?: string
}

/**
 * @param {Function} broadcast - broadcast records onto the platform
 * @param {Function} create - create records which can be broadcasted
 * @param {Function} get - get records from the platform
 */
interface Records {
    broadcast: Function,
    create: Function,
    get: Function,
}

/**
 * @param {Function} broadcast - broadcast credentials onto the platform
 * @param {Function} get - get credentials from the platform
 */
interface Credentials {
    get: Function,
    register: Function,
}

interface Identities {
    get: Function,
    register: Function,
    topUp: Function,
}

/**
 * Class for Dash Platform
 *
 * @param documents - documents
 * @param identities - identites
 * @param names - names
 * @param contracts - contracts
 */
export class Platform {
    dpp: DashPlatformProtocol;

    public documents: Records;
    /**
     * @param {Function} get - get identities from the platform
     * @param {Function} register - register identities on the platform
     */
    public identities: Identities;
    /**
     * @param {Function} get - get names from the platform
     * @param {Function} register - register names on the platform
     */
    public names: Credentials;
    /**
     * @param {Function} get - get contracts from the platform
     * @param {Function} create - create contracts which can be broadcasted
     * @param {Function} register - register contracts on the platform
     */
    public contracts: Records;

    client: Client;
    apps: ClientApps;
    network?: string;

    /**
     * Construct some instance of Platform
     *
     * @param {PlatformOpts} options - options for Platform
     */
    constructor(options: PlatformOpts) {
        this.documents = {
            broadcast: broadcastDocument.bind(this),
            create: createDocument.bind(this),
            get: getDocument.bind(this),
        };
        this.contracts = {
            broadcast: broadcastContract.bind(this),
            create: createContract.bind(this),
            get: getContract.bind(this),
        };
        this.names = {
            register: registerName.bind(this),
            get: getName.bind(this),
        };
        this.identities = {
            register: registerIdentity.bind(this),
            get: getIdentity.bind(this),
            topUp: topUpIdentity.bind(this),
        };

        const stateRepository = {
            fetchIdentity: getIdentity.bind(this),
            fetchDataContract: getContract.bind(this)
        };

        this.dpp = new DashPlatformProtocol({
            ...options,
            stateRepository,
        });

        this.client = options.client;
        this.apps = options.apps;
        this.network = options.network;
    }
}
