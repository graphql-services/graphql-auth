const fetch = require('node-fetch').default;
const url = require('url');
const querystring = require('querystring');

const { decodeToken } = require('./jwt');

const PARENT_URL = process.env.PARENT_URL || null;

const canFetchUserFromParent = () => {
  return PARENT_URL !== null;
};

const fetchUserFromParent = async (username, password) => {
  let parentURL = url.resolve(PARENT_URL, '/auth/token');
  const res = await fetch(parentURL, {
    method: 'POST',
    body: querystring.stringify({
      username,
      password,
      client_id: 'none',
      client_secret: 'none',
      grant_type: 'password'
    }),
    headers: { 'content-type': 'application/x-www-form-urlencoded' }
  });
  const json = await res.json();
  const token = await decodeToken(json.access_token);
  return token.user;
};

module.exports = {
  canFetchUserFromParent,
  fetchUserFromParent
};
