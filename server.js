import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. Головна сторінка, яка відкриється в браузері
app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="uk">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Дошка вакансій</title>
        </head>
        <body>
            <h1>Список вакансій</h1>
            <div id="jobs-container">Завантаження вакансій...</div>

            <script>
                async function loadJobs() {
                    const container = document.getElementById("jobs-container");
                    try {
                        const response = await fetch("/api/jobs");
                        const data = await response.json();
                        const jobs = data.results;

                        container.innerHTML = ""; // Очищаємо текст завантаження

                        jobs.forEach(job => {
                            const jobDiv = document.createElement("div");

                            const title = document.createElement("h2");
                            title.textContent = job.role;
                            jobDiv.appendChild(title);

                            const company = document.createElement("p");
                            company.textContent = "Компанія: " + (job.company_name || "Не вказано");
                            jobDiv.appendChild(company);

                            const location = document.createElement("p");
                            location.textContent = "Локація: " + (job.location || "Не вказано");
                            jobDiv.appendChild(location);

                            const remote = document.createElement("p");
                            remote.textContent = "Дистанційна робота: " + (job.remote ? "Так" : "Ні");
                            jobDiv.appendChild(remote);

                            const employmentType = document.createElement("p");
                            employmentType.textContent = "Тип зайнятості: " + (job.employment_type || "Не вказано");
                            jobDiv.appendChild(employmentType);

                            const date = document.createElement("p");
                            date.textContent = "Дата додавання: " + (job.date_posted || "Не вказано");
                            jobDiv.appendChild(date);

                            if (job.keywords && job.keywords.length > 0) {
                                const keywords = document.createElement("p");
                                keywords.textContent = "Ключові слова: " + job.keywords.join(", ");
                                jobDiv.appendChild(keywords);
                            }

                            const link = document.createElement("a");
                            link.href = job.url;
                            link.target = "_blank";
                            link.textContent = "Посилання на вакансію";
                            jobDiv.appendChild(link);

                            const separator = document.createElement("hr");
                            jobDiv.appendChild(separator);

                            container.appendChild(jobDiv);
                        });
                    } catch (error) {
                        container.textContent = "Помилка при завантаженні даних з сервера";
                    }
                }
                loadJobs();
            </script>
        </body>
        </html>
    `);
});

// 2. Внутрішній маршрут, з якого скрипт забирає дані
app.get("/api/jobs", async (req, res) => {
    try {
        const response = await fetch("https://findwork.dev/api/jobs/", {
            headers: {
                "Authorization": "Token 698c2a8a04ad534e1662a5f84caf36b1b34f9007"
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Помилка при отриманні вакансій" });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});