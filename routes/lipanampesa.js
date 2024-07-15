const express = require("express");
const router = express.Router();
const getToken = require("../middlewares/generateAccessToken");
const { intiateSTKPush, stkCallback } = require("../controllers/lipanampesa");

router.get("/", (req, res) => {
  res.send("Hello From Daraja Api");
});

router.post("/stk-push", getToken, intiateSTKPush);
router.post("/stkCallback", stkCallback);

module.exports = router;
