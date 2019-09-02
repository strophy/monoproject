const Revisions = require('../revisions/Revisions');

class SVDocument extends Revisions {
  /**
   * @param {string} userId
   * @param {Document} document
   * @param {Reference} reference
   * @param {boolean} [isDeleted]
   * @param {array} [previousRevisions]
   */
  constructor(userId, document, reference, isDeleted = false, previousRevisions = []) {
    super(reference, previousRevisions);

    this.userId = userId;
    this.document = document;
    this.deleted = isDeleted;
  }

  /**
   * Get user ID
   *
   * @return {string}
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Set user ID
   *
   * @return {SVDocument}
   */
  setUserId(userId) {
    this.userId = userId;

    return this;
  }

  /**
   * Get Document
   *
   * @return {Document}
   */
  getDocument() {
    return this.document;
  }

  /**
   * Mark document as deleted
   *
   * @return {SVDocument}
   */
  markAsDeleted() {
    this.deleted = true;

    return this;
  }

  /**
   * Is document deleted?
   *
   * @return {boolean}
   */
  isDeleted() {
    return this.deleted;
  }

  /**
   * Get revision number
   *
   * @private
   * @return {number}
   */
  getRevisionNumber() {
    return this.getDocument().getRevision();
  }

  /**
   * Return SVDocument as plain object
   *
   * @return {{reference: {
   *            blockHash: string,
   *            blockHeight: number,
   *            stHash: string,
   *            stPacketHash: string,
   *            hash: string
   *           },
   *           isDeleted: boolean,
   *           userId: string,
   *           data: RawDocument,
   *           scope: string,
   *           scopeId: string,
   *           action: number,
   *           currentRevision: {
   *            revision: number,
   *            reference: {
   *              blockHash: string,
   *              blockHeight: number,
   *              stHash: string,
   *              stPacketHash: string,
   *              hash: string
   *            }
   *           },
   *           previousRevisions: {
   *            revision: number,
   *            reference: {
   *              blockHash: string,
   *              blockHeight: number,
   *              stHash: string,
   *              stPacketHash: string,
   *              hash: string
   *            }
   *           }[]}}
   */
  toJSON() {
    return {
      userId: this.getUserId(),
      isDeleted: this.isDeleted(),
      data: this.getDocument().getData(),
      reference: this.getReference().toJSON(),
      scope: this.getDocument().scope,
      scopeId: this.getDocument().scopeId,
      action: this.getDocument().getAction(),
      currentRevision: this.getCurrentRevision().toJSON(),
      previousRevisions: this.getPreviousRevisions().map(r => r.toJSON()),
    };
  }
}

module.exports = SVDocument;