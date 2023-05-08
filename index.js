const express = require("express");

const app = express();
const host = "0.0.0.0";
const port = process.env.PORT || 3000;

app.set("views", "./views");
app.set("view engine", "pug");

// make public directory serve static files (images, css)
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home/how-it-works", (req, res) => {
  res.render("home/how-it-works");
});

app.get("/home", (req, res) => {
  // res.locals.activePage = "home";
  res.render("home");
});

app.get("/healthcheck", (req, res) => {
  res.sendStatus(200);
});

app.listen(port, host, () => {
  console.log(`Listening on port ${port} of ${host}!`);
});
