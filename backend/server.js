const express = require("express");
const app = express();
const cors = require("cors");
const { dbConnect } = require("./utils/db");
const bodyParser = require("body-parser");
const http = require('http')
const server = http.createServer(app);
require('dotenv').config();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(bodyParser.json())
app.use("/api", require("./routes/chatRoutes"));

app.get("/", (req, res) => res.send("Hello Server"));

const port = process.env.PORT || 9999;
dbConnect();
server.listen(port, () => console.log(`Server is running on port ${port}`));
