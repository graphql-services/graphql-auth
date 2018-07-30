const cron = require('cron');
const NappJSService = require('nappjs').NappJSService;

class Signing extends NappJSService {
  async load(napp) {
    this.cron = new cron.CronJob('0 0 * * * *', async () => {
      await this.updateCertificates(napp);
    });

    const app = napp.getService('nappjs-api').app;
    app.get('/auth/certs', async (req, res, next) => {
      let certificates = await req.context.getObjects('Certificate');
      res.send(
        certificates.map(c => {
          return {
            key: Buffer.from(c.public, 'utf8').toString('base64'),
            expireAt: c.expireAt
          };
        })
      );
    });
  }
  async start(napp) {
    this.cron.start();
    await this.updateCertificates(napp);
  }
  async stop(napp) {
    this.cron.stop();
  }

  async updateCertificates(napp) {
    return napp.runScript('check-certificates');
  }
}

module.exports = Signing;
