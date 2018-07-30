const selfsigned = require("selfsigned");
const moment = require("moment");

const ACCOUNTS_CERTIFICATE_VALID_DAYS =
  process.env.ACCOUNTS_CERTIFICATE_VALID_DAYS || 90;
const ACCOUNTS_CERTIFICATE_COMMON_NAME =
  process.env.ACCOUNTS_CERTIFICATE_COMMON_NAME || "accounts certificate";

const genereateNewCertificate = async () => {
  const attrs = [
    { name: "commonName", value: ACCOUNTS_CERTIFICATE_COMMON_NAME }
  ];
  return new Promise((resolve, reject) => {
    const options = {
      days: ACCOUNTS_CERTIFICATE_VALID_DAYS
    };
    selfsigned.generate(attrs, options, function(err, pems) {
      if (err) return reject(err);

      pems.expireAt = moment()
        .add(ACCOUNTS_CERTIFICATE_VALID_DAYS, "day")
        .toDate();

      resolve(pems);
    });
  });
};

module.exports = {
  genereateNewCertificate
};
