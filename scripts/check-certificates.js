const { NappJSScript } = require("nappjs");

const certificates = require("../lib/certificates");

class CheckCertificates extends NappJSScript {
  async run(nappjs) {
    await this.updateCertificates(nappjs);
  }

  async updateCertificates(napp) {
    const database = napp.getService("nappjs-core-data").database;
    const context = database.createContext();

    let certCount = await context.getObjectsCount("Certificate");
    if (certCount == 0) {
      await this.createCertificate(context);
    }

    return context.saveAndDestroy();
  }

  async createCertificate(context) {
    let pems = await certificates.genereateNewCertificate();
    context.create("Certificate", pems);
  }
}

module.exports = CheckCertificates;
