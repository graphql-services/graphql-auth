const Router = require('express').Router;
const OAuthServer = require('express-oauth-server');
const bodyParser = require('body-parser');
const { createModel } = require('../lib/oauth');

const NappJSService = require('nappjs').NappJSService;

class OAuth extends NappJSService {
  async load(napp) {
    const database = napp.getService('nappjs-core-data').database;
    const app = napp.getService('nappjs-api').app;

    const model = createModel(database);

    const oauth = new OAuthServer({
      model
    });

    app.use(bodyParser.urlencoded({ extended: false }));

    app.post('/auth', oauth.authorize());
    app.post('/auth/token', oauth.token());
  }
}

module.exports = OAuth;
