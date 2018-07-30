const createError = require('http-errors');
const NappJSService = require('nappjs').NappJSService;

class Auth extends NappJSService {
  async load(napp) {
    const app = napp.getService('nappjs-api').app;
    const jwt = napp.getService('nappjs-jwt');

    app.use(async (req, res, next) => {
      if (
        req.path.indexOf('/auth') === 0 ||
        req.path == '/' ||
        req.path == '/healthcheck'
      ) {
        return next();
      }
      try {
        let enabled = await jwt.isEnabled(req);
        if (enabled) {
          let token = await jwt.getToken(req);
          let scopes = (token.scope || '').split(' ');
          if (scopes.indexOf('accounts') === -1) {
            throw createError(401, `token missing require scope 'accounts'`);
          }
        } else {
          console.log('JWT configuration is not provided');
        }
        next();
      } catch (e) {
        next(e);
      }
    });
  }
}

module.exports = Auth;
