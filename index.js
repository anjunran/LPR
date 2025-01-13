const express = require("express");
const path = require("path");
require("dotenv").config();

const cuiRouter = require("./routes/cui.router");
const filterRouter = require("./routes/filters.router");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use("/cui", cuiRouter);
app.use("/filter", filterRouter);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
