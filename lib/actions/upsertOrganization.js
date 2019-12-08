/* eslint no-param-reassign: "off" */

/**
 * Copyright 2019 Wice GmbH
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

const Q = require('q');
const { getToken } = require('./../utils/authentication');
const { resolve } = require('./../utils/resolver');
const { upsertObject, checkId } = require('./../utils/helpers');

/**
 * This method will be called from OIH platform providing following data
 *
 * @param {Object} msg - incoming message object that contains ``body`` with payload
 * @param {Object} cfg - configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  // const token = cfg.API_KEY;
  const token = await getToken(cfg);
  const self = this;
  const oihUid = (msg.body.meta !== undefined && msg.body.meta.oihUid !== undefined) ? msg.body.meta.oihUid : 'oihUid not set yet';
  const recordUid = (msg.body !== undefined && msg.body.meta.recordUid !== undefined) ? msg.body.meta.recordUid : undefined;
  const applicationUid = (msg.body.meta !== undefined && msg.body.meta.applicationUid !== undefined) ? msg.body.meta.applicationUid : undefined;

  async function emitData() {
    /** Create an OIH meta object which is required
    * to make the Hub and Spoke architecture work properly
    */
    const { uid } = msg.body.meta;
    const newElement = {};
    const oihMeta = {
      applicationUid,
      oihUid,
      recordUid,
    };

    let objectExists = false;
    let organizationObject = msg.body.data;

    /** IMPORTANT: This function is used ONLY for internal purposes
    * You do NOT have to implement it in your adapter
    * It just checks if an uid is in the list of protected objects
    */
    const validUid = checkId(uid);

    if (uid && uid !== '' && uid !== 'undefined' && validUid) { // validUid is NOT required
      /** Conflict Management implementation
      * This part is NOT required. If you want to
      * implement CFM please visit the following link:
      * https://github.com/openintegrationhub/openintegrationhub/tree/master/lib/cfm
      */
      const cfmResponse = await resolve(msg, token, 'organization');

      if (cfmResponse) {
        organizationObject = cfmResponse.resolvedConflict;
        objectExists = cfmResponse.exists;
      }
    }

    // Upsert the object depending on 'objectExists' property
    const reply = await upsertObject(organizationObject, token, objectExists, 'organization');

    if (objectExists) {
      const result = [];
      reply.forEach((elem) => {
        delete elem.payload.uid;
        result.push(elem);
      });
      newElement.meta = oihMeta;
      newElement.data = result;
    } else {
      oihMeta.recordUid = reply.payload.uid;
      delete reply.payload.uid;
      newElement.meta = oihMeta;
      newElement.data = reply.payload;
    }

    self.emit('data', newElement);
  }

  /**
   * This method will be called from OIH platform if an error occured
   *
   * @param e - object containg the error
   */
  function emitError(e) {
    console.log('Oops! Error occurred');
    self.emit('error', e);
  }

  /**
   * This method will be called from OIH platform
   * when the execution is finished successfully
   *
   */
  function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  Q()
    .then(emitData)
    .fail(emitError)
    .done(emitEnd);
}

module.exports = {
  process: processAction,
};
