const axios = require("axios");
const getTimestamp = require("../utils/timestamp");

//Intiate STK push
const intiateSTKPush = async (req, res) => {
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;

  const token = req.access_token;

  const timestamp = getTimestamp();

  const shortCode = process.env.SHORTCODE;
  const passKey = process.env.PASSKEY;

  const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString(
    "base64"
  );

  try {
    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: `254${phone}`,
        PartyB: shortCode,
        PhoneNumber: `254${phone}`,
        CallBackURL:
          "https://04d3-196-250-215-152.ngrok-free.app/api/stkCallback",
        AccountReference: "daraja",
        TransactionDesc: "Testing stk push",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(502).json(error.message);
  }
};

//STK Callback that will be called by Safaricom and confirm the payment then consoles out the response
const stkCallback = (req, res) => {
  const callback = req.body;
  console.log(callback);
};

module.exports = { intiateSTKPush, stkCallback };
