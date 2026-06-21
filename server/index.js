const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const lipanampesaRoutes = require("./routes/lipanampesa");
const transactionsRoutes = require("./routes/transactions");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api", lipanampesaRoutes);
app.use("/api/transactions", transactionsRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  console.log("TUNAUNDA MPESA API");
});
