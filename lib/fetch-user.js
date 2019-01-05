const fetch = require('node-fetch');

const CREDENTIALS_STORE_URL = process.env.CREDENTIALS_STORE_URL;
const USER_ADDITIONAL_FIELDS = process.env.USER_ADDITIONAL_FIELDS;

const userAdditionalFields = (USER_ADDITIONAL_FIELDS
  ? USER_ADDITIONAL_FIELDS.split(',')
  : []
).join(' ');

const fetchUser = async (username, password) => {
  if (!CREDENTIALS_STORE_URL) {
    throw new Error(`CREDENTIALS_STORE_URL not provided`);
  }
  const query = `query authorizeUser{
    user(filter:{username:"${username.replace(
      /"/,
      '"'
    )}",password:"${password.replace(/"/, '"')}"}) {
      id
      username
      ${userAdditionalFields}
      permissions
      roles {
        name
        permissions
      }
    }
  }`;
  const variables = {};

  const req = fetch(CREDENTIALS_STORE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });
  const res = await req;

  if (res.status >= 400) {
    const text = await res.text();
    throw new Error(`Unexpected response, code: ${res.status}, body: ${text}`);
  }

  const json = await res.json();

  const user = json.data && json.data.user;

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

module.exports = {
  fetchUser
};
