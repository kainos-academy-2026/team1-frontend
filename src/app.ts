import express from "express";
import path from "path";
import nunjucks from "nunjucks";
import { fileURLToPath } from "url";
import { getJobRoles } from "./jobRoleService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

const viewsPath = path.join(__dirname, "views");

nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app,
});

app.get("/", (req, res) => {
    res.render("layouts/base.njk", { title: "Home" });
});

app.get("/job-roles", async (req, res) => {
    const jobRoles = await getJobRoles();
    res.render("job-roles.njk", { jobRoles });
});