/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const nock = require('nock');
const { getToken, getObjects, upsertObject } = require('./../lib/utils/helpers');

describe('Helpers', () => {
  it('should perform a login', async () => {
    nock('https://api.example.com')
      .post('/login', { username: 'ExampleUser', password: 'ExamplePassword' })
      .reply(200, { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' });


    const cfg = {
      username: 'ExampleUser',
      password: 'ExamplePassword',
    };
    const token = await getToken(cfg);
    expect(token).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
  });

  it('should get Objects, filtered by timestamp', async () => {
    nock('https://api.example.com', { reqheaders: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' } })
      .get('/')
      .reply(200, [
        {
          firstName: 'Jane',
          lastName: 'Doe',
          lastUpdate: '2020-10-26T15:44:10+0000',
        },
        {
          firstName: 'Somebody',
          lastName: 'Else',
          lastUpdate: '2019-10-26T15:44:10+0000',
        },
        {
          firstName: 'Nobody',
          middleName: 'of',
          lastName: 'Note',
          lastUpdate: '2018-10-26T15:44:10+0000',
        },
      ]);

    const objects = await getObjects('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', { lastUpdate: '2019-05-12T15:44:10+0000' });

    expect(objects).to.have.lengthOf(2);
  });

  it('should dynamically insert an object', async () => {
    nock('https://api.example.com', { reqheaders: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' } })
      .post('/', { firstName: 'New', lastName: 'Entry' })
      .reply(201, { id: '4711' });


    const { success, responseId } = await upsertObject({ firstName: 'New', lastName: 'Entry' }, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

    expect(success).to.be.true;
    expect(responseId).to.equal('4711');
  });

  it('should dynamically update an object', async () => {
    nock('https://api.example.com', { reqheaders: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' } })
      .get('/4711')
      .reply(200, { id: '4711' });

    nock('https://api.example.com', { reqheaders: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' } })
      .put('/4711', { firstName: 'Updated' })
      .reply(200, { id: '4711' });


    const { success, responseId } = await upsertObject({ firstName: 'Updated' }, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', '4711');

    expect(success).to.be.true;
    expect(responseId).to.equal('4711');
  });
});
