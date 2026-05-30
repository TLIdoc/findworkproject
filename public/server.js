import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.static("public"));

const API_KEY = "698c2a8a04ad534e1662a5f84caf36b1b34f9007";

app.get("/api/jobs", async (req, res) => {
    const response = await fetch("https://findwork.dev/api/jobs/", {
    headers: {
        Authorization: `Bearer ${API_KEY}`
    }
    });

    const data = await response.json();
    res.json(data);
});

app.listen(3000);