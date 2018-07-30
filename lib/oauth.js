const sha512 = require('js-sha512');
const jwt = require('./jwt');
const yaml = require('js-yaml');

const { canFetchUserFromParent, fetchUserFromParent } = require('./parent');
const { fetchUser } = require('./fetch-user');

const createModel = database => {
  return {
    generateAccessToken: async (client, user, scope) => {
      const iat = Math.floor(Date.now() / 1000);
      const sub = user.uid;
      let payload = { user, scope, iat, sub };
      let config = await jwt.getTokenConfiguration(database);
      return jwt.generateAccessToken(payload, config);
    },
    getClient: async (clientId, clientSecret) => {
      // console.log('get client', clientId, clientSecret);
      const context = database.createContext();
      let client = await context.getObject('Client', {
        where: {
          uid: clientId,
          secret: clientSecret
        }
      });

      if (!client) {
        return { id: clientId, grants: ['password'] };
      }

      let values = client.getValues();
      if (typeof values.grants === 'string') {
        values.grants = values.grants.split(',');
      }

      context.destroy();

      return values;
    },
    getUser: async (username, password) => {
      let user = await fetchUser(username, sha512(password));

      if (!user && canFetchUserFromParent()) {
        const userData = await fetchUserFromParent(username, password);
        return userData;
      }

      if (!user) return null;

      let permissions = [];
      if (user.permissions) {
        permissions = permissions.concat(user.permissions.split('\n'));
      }
      if (user.roles) {
        for (let role of user.roles) {
          permissions.push(role.permissions);
        }
      }

      let metadata = null;
      try {
        metadata = yaml.safeLoad(user.metadata);
      } catch (e) {}

      return {
        uid: user.uid,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        permissions: permissions.join('\n'),
        metadata: metadata
      };
    },
    saveToken: async (token, client, user) => {
      // console.log("save token", token, client, user);
      const context = database.createContext();

      token.accessTokenExpiresAt = new Date(Date.now() + 1000 * 3600 * 24 * 90);

      context.create('Token', {
        type: 'access',
        token: token.accessToken,
        expiresAt: new Date(Date.now() + token.accessTokenExpiresAt * 1000)
      });

      if (token.refreshToken) {
        context.create('Token', {
          type: 'refresh',
          token: token.refreshToken,
          expiresAt: new Date(Date.now() + token.refreshTokenExpiresAt * 1000)
        });
      }

      token.client = client;
      token.user = user;

      await context.saveAndDestroy();

      return token;
    },
    getUserFromClient: async client => {
      const context = database.createContext();

      let user = await context.getObject('User', {
        where: { 'SELF.clients.id': client.id }
      });

      let values = user.getValues();
      await context.destroy();

      return values;
    }
  };
};

module.exports = { createModel };
