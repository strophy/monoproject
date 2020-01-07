const DashJS = require('dash');

const sdkOpts = {
  network: 'testnet'
};
const sdk = new DashJS.SDK(sdkOpts);

const getIdentity = async function () {
  let platform = sdk.platform;
  await sdk.isReady();

  platform
      .identities
      .get('3GegupTgRfdN9JMS8R6QXF3B2VbZtiw63eyudh1oMJAk')
      .then((identity) => {
        console.log({identity});
      });

};
getIdentity();
