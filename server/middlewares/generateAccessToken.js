const axios = require("axios");

const getToken = async (req, res, next) => {
  const secret_key = process.env.SECRET_KEY;
  const consumer_key = process.env.CONSUMER_KEY;

  const auth = Buffer.from(`${consumer_key}:${secret_key}`).toString("base64");

  try {
    const response = await axios.get(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    );

    req.access_token = response.data.access_token;

    next();
  } catch (err) {
    console.log(err);
    res.status(502).json(err.message);
  }
};

module.exports = getToken;
