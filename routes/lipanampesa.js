const express = require("express");
const router = express.Router();
const getToken = require("../middlewares/generateAccessToken");
const { intiateSTKPush, stkCallback } = require("../controllers/lipanampesa");

// Route to test if the server is working
router.get("/", (req, res) => {
  res.send("Hello From Daraja Api");
});

// Route to get the access token
router.get("/get-token", getToken, (req, res) => {
  res.send({ access_token: req.access_token });
});

router.post("/stk-push", getToken, intiateSTKPush); //intiateSTKPush will be called after getToken middleware
router.post("/stkCallback", stkCallback); //Route to get the callback data from safaricom

module.exports = router;
