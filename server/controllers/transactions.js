const db = require("../utils/db");

const getAllTransactions = async (req, res) => {
  try {
    const [transactions] = await db.execute(
      `SELECT id, phone_number, amount, status, merchant_request_id, checkout_request_id,
              mpesa_receipt, result_code, account_reference, created_at, updated_at
       FROM transactions
       ORDER BY created_at DESC`,
    );

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No transactions found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllTransactions,
};
