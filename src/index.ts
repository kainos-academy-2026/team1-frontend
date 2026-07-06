import express from "express";
import "dotenv/config";
import path from "path";
import nunjucks from "nunjucks";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Set up Nunjucks as the template engine
const viewsPath = path.join(__dirname, "views");

nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app,
});

// Route for the home page
app.get("/", (req, res) => {
    res.render("layouts/base.njk", { title: "Home" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
