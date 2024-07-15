const express = require("express");
const router = express.Router();
const getToken = require("../middlewares/generateAccessToken");
const intiateSTKPush = require("../controllers/lipanampesa");

router.get("/", (req, res) => {
  res.send("Hello From Daraja Api");
});

router.post("/stk-push", getToken, intiateSTKPush);

module.exports = router;
