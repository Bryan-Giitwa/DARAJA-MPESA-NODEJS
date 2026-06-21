const db = require("../utils/db");

const DELETE_RECORD_CODES = [
  -1, 1032, 1037, 17, 1, 1001, 1002, 1003, 1004, 2001, 4002, 5000,
];

async function handleStkError(resultCode, resultDesc, pendingTx) {
  try {
    if (DELETE_RECORD_CODES.includes(resultCode)) {
      try {
        await db.execute(
          "DELETE FROM transactions WHERE merchant_request_id = ? AND checkout_request_id = ? AND status = ?",
          [
            pendingTx.merchantRequestId,
            pendingTx.checkoutRequestId,
            "pending",
          ]
        );
      } catch (dbErr) {
        console.error("Failed to delete pending transaction:", dbErr.message);
      }
    }

    return {
      success: false,
      code: resultCode,
      message: getErrorMessage(resultCode, resultDesc),
    };
  } catch (error) {
    console.error(`STK error handling failed: ${error.message}`);
    return {
      success: false,
      action: "error",
      message: error.message,
    };
  }
}

function getErrorMessage(code, defaultDesc) {
  const messages = {
    1: "Insufficient Funds — User's account doesn't have enough money",
    1032: "Request cancelled by user — Customer manually cancelled the STK push prompt",
    1037: "Timeout in processing — Took too long; no user response or network delays",
    1001: "Request Rejected — Bad request or missing required parameters",
    1002: "Invalid Credentials — Wrong or expired API credentials",
    1003: "Invalid Phone Number — The phone number format is wrong",
    1004: "Invalid Amount — Amount sent is invalid",
    2001: "Transaction failed — General failure",
    4002: "Internal error — Safaricom server-side issue",
    5000: "User does not exist — The phone number is not registered on M-PESA",
    17: "Request cancelled — Cancellation from user side",
  };

  return messages[code] || defaultDesc || `Unknown error (Code: ${code})`;
}

module.exports = { handleStkError, DELETE_RECORD_CODES };
