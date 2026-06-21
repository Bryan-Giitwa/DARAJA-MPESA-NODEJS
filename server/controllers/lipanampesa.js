const axios = require("axios");
const getTimestamp = require("../utils/timestamp");
const db = require("../utils/db");
const {
  handleStkError,
  DELETE_RECORD_CODES,
} = require("../middlewares/handleStkError");

const generateAccountReference = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(2, "0");
  return `THANK-YOU-@-${year}-${randomNum}`;
};

const intiateSTKPush = async (req, res) => {
  try {
    const phone = req.body.phone;
    const amount = req.body.amount;

    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone number and amount are required",
      });
    }

    const sanitizedPhone = phone.replace(/^0/, "");
    if (!sanitizedPhone.match(/^[17]\d{8}$/)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid phone number format. Expected: 0700000000 or 0100000000",
      });
    }

    const formattedPhone = `254${sanitizedPhone}`;
    const token = req.access_token;
    const timestamp = getTimestamp();
    const shortCode = process.env.SHORTCODE;
    const passKey = process.env.PASSKEY;

    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString(
      "base64",
    );

    const accountReference = generateAccountReference();

    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.CALLBACK_URL}/api/stkCallback`,
        AccountReference: accountReference,
        TransactionDesc: "Testing stk push",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await db.execute(
      `INSERT INTO transactions
       (merchant_request_id, checkout_request_id, phone_number, amount, status, account_reference)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        response.data.MerchantRequestID,
        response.data.CheckoutRequestID,
        formattedPhone,
        amount,
        "pending",
        accountReference,
      ],
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("STK Push Error:", error.message);
    res.status(502).json({
      success: false,
      error: error.message,
    });
  }
};

const stkCallback = async (req, res) => {
  try {
    const stkCallback = req.body.Body?.stkCallback;

    if (!stkCallback) {
      return res.status(400).json({ error: "Invalid callback format" });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    if (ResultCode !== 0) {
      if (
        Array.isArray(DELETE_RECORD_CODES) &&
        DELETE_RECORD_CODES.includes(ResultCode)
      ) {
        try {
          await db.execute(
            "DELETE FROM transactions WHERE merchant_request_id = ? AND checkout_request_id = ? AND status = ?",
            [MerchantRequestID, CheckoutRequestID, "pending"],
          );
          console.log(
            `Deleted pending transaction for error code ${ResultCode}`,
          );
        } catch (dbErr) {
          console.error("Failed to delete pending transaction:", dbErr.message);
        }
      }

      await handleStkError(ResultCode, ResultDesc, {
        merchantRequestId: MerchantRequestID,
        checkoutRequestId: CheckoutRequestID,
      });

      return res.status(200).json({
        success: false,
        message: ResultDesc,
        ResultCode: ResultCode,
      });
    }

    let mpesaReceipt = "";
    let phone = "";
    let amount = 0;

    if (CallbackMetadata && CallbackMetadata.Item) {
      CallbackMetadata.Item.forEach((item) => {
        if (item.Name === "MpesaReceiptNumber") mpesaReceipt = item.Value;
        if (item.Name === "PhoneNumber") phone = item.Value;
        if (item.Name === "Amount") amount = item.Value;
      });
    }

    const [result] = await db.execute(
      `UPDATE transactions
       SET status = 'completed', mpesa_receipt = ?, amount = ?, phone_number = ?, result_code = ?
       WHERE merchant_request_id = ? AND checkout_request_id = ? AND status = 'pending'`,
      [
        mpesaReceipt,
        amount,
        phone,
        ResultCode,
        MerchantRequestID,
        CheckoutRequestID,
      ],
    );

    if (result.affectedRows === 0) {
      console.warn("Transaction not found or already processed");
    }

    return res
      .status(200)
      .json({ success: true, message: "Transaction updated" });
  } catch (error) {
    console.error("STK Callback Error:", error.message);
    return res.status(200).json({ error: error.message });
  }
};

module.exports = { intiateSTKPush, stkCallback };
