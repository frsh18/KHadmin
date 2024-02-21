// app.js
const express = require("express");
const session = require("express-session");
const mongoConfig = require("./mongoConfig");
const app = express();

app.use(session({
    secret: "anything",
    resave: false,
    saveUninitialized: true
}));

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));

module.exports = app;