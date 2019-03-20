const bs58 = require('bs58');

/**
 * @param {DataProvider} dataProvider
 * @return {fetchDocumentsByDocuments}
 */
function fetchDocumentsByDocumentsFactory(dataProvider) {
  /**
   * @typedef fetchDocumentsByDocuments
   * @param {string} dpContractId
   * @param {Document[]} documents
   * @return {Document[]}
   */
  async function fetchDocumentsByDocuments(dpContractId, documents) {
    // Group Document IDs by types
    const documentIdsByTypes = documents.reduce((obj, document) => {
      if (!obj[document.getType()]) {
        // eslint-disable-next-line no-param-reassign
        obj[document.getType()] = [];
      }

      const idBuffer = Buffer.from(document.getId(), 'hex');
      const id = bs58.encode(idBuffer);

      obj[document.getType()].push(id);

      return obj;
    }, {});

    // Convert object to array
    const documentArray = Object.entries(documentIdsByTypes);

    // Fetch Documents by IDs
    const fetchedDocumentsPromises = documentArray.map(([type, ids]) => {
      const options = {
        where: { _id: { $in: ids } },
      };

      return dataProvider.fetchDocuments(
        dpContractId,
        type,
        options,
      );
    });

    const fetchedDocumentsByTypes = await Promise.all(fetchedDocumentsPromises);

    return fetchedDocumentsByTypes.reduce((array, docs) => array.concat(docs), []);
  }

  return fetchDocumentsByDocuments;
}

module.exports = fetchDocumentsByDocumentsFactory;
