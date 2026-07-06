import express from "express";
import "dotenv/config";
import path from "path";
import nunjucks from "nunjucks";

const app = express();
const PORT = process.env.PORT || 3000;

nunjucks.configure(path.join(__dirname, "views"), {
    autoescape: true,
    express: app,
});

app.get("/", (req, res) => {
    res.render("layouts/base.njk", { title: "Home" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
