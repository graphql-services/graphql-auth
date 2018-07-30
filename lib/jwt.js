const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const generateAccessToken = async (payload, config) => {
  let token = jwt.sign(payload, config.secret, config.options);
  return token;
};

const verifyToken = async (token, secret, options) => {
  return jwt.verify(token, secret, options);
};

const decodeToken = async (token, options) => {
  return jwt.decode(token, options);
};

const getTokenConfiguration = async database => {
  if (JWT_SECRET)
    return { secret: JWT_SECRET, options: { algorithm: 'HS256' } };
  const context = database.createContext();
  const cert = await context.getObject('Certificate');

  if (!cert)
    throw new Error(
      'No certificate found. Provide JWT_SECRET or wait until new certificate is generated.'
    );

  const secret = cert.private;
  context.destroy();
  return { secret: secret, options: { algorithm: 'RS256' } };
};

module.exports = {
  generateAccessToken,
  verifyToken,
  decodeToken,
  getTokenConfiguration
};
