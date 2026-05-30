import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.get("/api/jobs", async (req, res) => {
    try {
        // Приклад отримання даних з зовнішнього джерела
        const response = await fetch("https://findwork.dev/api/jobs/", {
            headers: {
                "Authorization": "698c2a8a04ad534e1662a5f84caf36b1b34f9007" 
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Помилка при отриманні вакансій" });
    }
});
app.get("/", (req, res) => {
    res.send("<h1>Це моя дошка вакансій</h1><p>Сервер працює успішно!</p>");
});

app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});