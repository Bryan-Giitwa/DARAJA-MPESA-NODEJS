const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("./routes/lipanampesa");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api", routes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  console.log("TUNAUNDA MPESA API");
});
