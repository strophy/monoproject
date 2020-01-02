import {Platform} from "../../Platform";

declare interface createOpts {
    [name:string]: any;
}

export function create(this: Platform, typeLocator: string, identity: any, opts: createOpts): any {
    const {  dpp } = this;

    const appNames = Object.keys(this.apps);

    //We can either provide of type `dashpay.profile` or if only one schema provided, of type `profile`.
    const [appName, fieldType] = (typeLocator.includes('.')) ? typeLocator.split('.') : [appNames[0], typeLocator];


    if(!this.apps[appName] || !this.apps[appName]){
        throw new Error(`Cannot find contractId for ${appName}`);
    }
    const dataContract = this.contracts.get(this.apps[appName].contractId);
    return dpp.document.create(
        dataContract,
        identity.getId(),
        fieldType,
        opts,
    );
}

export default create;
