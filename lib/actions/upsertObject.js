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

const { upsertObject, getToken } = require('./../utils/helpers');

/**
 * This method will be called from OIH platform upon receiving data
 *
 * @param {Object} msg - incoming message object that contains keys `data` and `metadata`
 * @param {Object} cfg - configuration that contains login information and configuration field values
 */
async function processAction(msg, cfg) {
  try {
    /*
       This function performs a login and returns an access token.
       If your application supports persistent API keys, you can instead simply use the key directly.
    */
    const token = await getToken(cfg);

    /*
      This metadata is used to identify the current object within the OIH and your application
      "oihUid" uniquely identifies it within the OIH itself
      "recordUid" is used to identify it within your application
    */
    const { oihUid, recordUid } = msg.metadata;

    // Execute the upsert operation
    const { success, responseId } = await upsertObject(msg.data, token, recordUid);

    if (success) {
      const newElement = {
        metadata: {
          oihUid,
          recordUid: responseId,
        },
      };

      // Once finished, emit the new metadata to allow the OIH to synchronise ids
      this.emit('data', newElement);
    }

    console.log('Finished execution');
    this.emit('end');
  } catch (e) {
    console.log(`ERROR: ${e}`);
    this.emit('error', e);
  }
}

module.exports = {
  process: processAction,
};
