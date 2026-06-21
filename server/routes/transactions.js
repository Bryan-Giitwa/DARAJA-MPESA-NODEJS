const express = require("express");
const router = express.Router();
const { getAllTransactions } = require("../controllers/transactions");

// Get all transactions
router.get("/", getAllTransactions);

module.exports = router;
