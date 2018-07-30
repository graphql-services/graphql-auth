const fetch = require('node-fetch');

const CREDENTIALS_STORE_URL = process.env.CREDENTIALS_STORE_URL;

const fetchUser = async (username, password) => {
  if (!CREDENTIALS_STORE_URL) {
    throw new Error(`CREDENTIALS_STORE_URL not provided`);
  }
  const query = `query($username: String, $password: String) {
    users(filter:{username:$username,password:$password}) {
      items {
        id
        username
        permissions
        roles {
          name
          permissions
        }
      }
    }
  }`;
  const variables = { username, password };

  const req = fetch(CREDENTIALS_STORE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });
  const res = await req;
  const json = await res.json();

  const users = json.data && json.data.users && json.data.users.items;

  console.log('??', JSON.stringify(json), users);
  if (!users || !Array.isArray(users)) {
    throw new Error('Error fetching user');
  }

  if (users.length === 0) {
    throw new Error('User not found');
  }

  return users[0];
};

module.exports = {
  fetchUser
};
