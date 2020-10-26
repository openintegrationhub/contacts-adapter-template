const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });

// Replace this with you api's base URI
const BASE_URI = 'https://api.example.com';

/**
 * This method fetches persons from an API
 *
 * @param options - request options
 * @param snapshot - current state of snapshot
 * @return {Object} - Array of person objects containing data and meta
 */
async function fetchAll(options, snapshot) {
  try {
    const result = [];
    const entries = await request.get(options);

    if (Object.entries(entries.body).length === 0 && entries.body.constructor === Object) {
      return false;
    }
    entries.body.data.filter((person) => {
      // Push only this objects which were updated after last function call
      if (person.lastUpdate > snapshot.lastUpdated) {
        return result.push(person);
      }
      return person;
    });

    // Sort the objects by lastUpdate
    result.sort((a, b) => parseInt(a.lastUpdate, 10) - parseInt(b.lastUpdate, 10));
    return {
      result,
      count: entries.body.meta.count,
    };
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * @desc Internal function that checks whether an object with a certain ID already
 * exists in the target system
 *
 * @access  Private
 * @param {String} token - An authorization/access token
 * @param {String} recordUid - A unique ID identifying an object in the target system
 * @return {Boolean} - true if object exists, false if not
 */
async function checkExistence(token, recordUid) {
  try {
    const response = await request({
      method: 'GET',
      uri: `${BASE_URI}/${recordUid}`,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.statusCode === 200) {
      return true;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * @desc Upsert function which creates or updates
 * an object, depending on whether it already exists in the target system
 *
 * @access  Private
 * @param {Object} object - The data object that will be pushed to the API
 * @param {String} token - An authorization/access token
 * @param {String} recordUid
 * @return {Object} - the new created ot update object in Snazzy Contacts
 */
async function upsertObject(object, token, recordUid) {
  /* If a recordUid is supplied, double-check whether the object exists in the target system
     If your api natively supports conditional upserting, you can skip this step
  */
  let objectExists = false;

  if (recordUid) {
    objectExists = await checkExistence(token, recordUid);
  }

  let method;
  let uri;

  if (objectExists) {
    // Update the object if it already exists
    method = 'PUT';
    uri = `${BASE_URI}/${recordUid}`;
  } else {
    // Create the object if it does not exist
    method = 'POST';
    uri = `${BASE_URI}`;
  }

  try {
    const result = await request({
      method,
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: object,
    });

    if (result.statusCode === 200 || result.statsCode === 201) {
      return { success: true, responseId: result.body.id || recordUid };
    }
    return { success: false };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

/**
 * This method fetches objects from Snazzy Contacts
 * depending on the value of count variable and type
 *
 * @param token - Snazzy Contacts token required for authentication
 * @param snapshot - current state of snapshot
 * @param count - amount of objects
 * @return {Object} - Array of person objects containing data and meta
 */
async function getEntries(token, snapshot, count, type) {
  let uri;
  if (count) {
    uri = `${BASE_URI}/${type}?num=${count}`;
  } else {
    uri = `${BASE_URI}/${type}`;
  }

  try {
    const requestOptions = {
      uri,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const entries = await fetchAll(requestOptions, snapshot);

    if (!entries.result || !Array.isArray(entries.result)) {
      return 'Expected records array.';
    }
    return entries;
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * This method will authenticate the user in Snazzy Contacts
 * and return a Bearer token if it is successful
 *
 * @param {Object} config - incoming message object that contains username and password
 * @return {String} - Bearer token
 */
async function getToken(config) {
  try {
    const tokenRequest = await request.post({
      uri: `${BASE_URI}/login`,
      json: true,
      body: {
        username: config.username,
        password: config.password,
      },
    });

    const { token } = tokenRequest.body;
    return token;
  } catch (err) {
    return err;
  }
}


module.exports = { getEntries, upsertObject, getToken };
