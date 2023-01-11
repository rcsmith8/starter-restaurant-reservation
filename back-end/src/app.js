
if (process.env.USER || process.env.USERNAME) require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const reservationsRouter = require("./reservations/reservations.router");
const tablesRouter = require("./tables/tables.router")

const app = express();

app.use(cors());
app.use(express.json());

app.use("/reservations", reservationsRouter);
app.use("/tables", tablesRouter)

app.use(notFound);
app.use(errorHandler);

module.exports = app;
