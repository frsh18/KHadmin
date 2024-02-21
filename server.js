const express = require("express");
const session = require("express-session");
const mongoConfig = require("./mongoConfig");
const bodyParser = require("body-parser");

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
app.use(bodyParser.urlencoded({ extended: true }));

// 在這裡調用 MongoDB 連線
mongoConfig.connect();

// 引入路由模組
const routes = require("./routes")(app);
app.use("/", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});