import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Динамічний порт для Render
const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = http.createServer(async (req, res) => {
    // 1. Налаштовуємо CORS-заголовки для ВСІХ запитів
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    // 2. Обробка предзапиту OPTIONS (щоб браузер не блокував CORS)
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Головний try/catch захищає сервер від падіння, якщо зникне якийсь файл
    try {
        // Головна сторінка
        if (req.url === "/" && req.method === "GET") {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            let file = await fs.readFile(path.join(__dirname, "public", "index.html"));
            res.end(file);
        } 
        // СТОРІНКА НАЛАШТУВАНЬ
        else if (req.url === "/settings" && req.method === "GET") {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            let file = await fs.readFile(path.join(__dirname, "public", "settings.html"));
            res.end(file);
        } 
        // СТОРІНКА ПРО НАС
        else if (req.url === "/about" && req.method === "GET") {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            let file = await fs.readFile(path.join(__dirname, "public", "about.html"));
            res.end(file);
        } 
        // СКРИПТ
        else if (req.url === "/script.js" && req.method === "GET") {
            res.writeHead(200, { "Content-Type": "application/javascript" });
            let file = await fs.readFile(path.join(__dirname, "public", "script.js"));
            res.end(file);
        } 
        // СТИЛІ
        else if (req.url === "/css.css" && req.method === "GET") {
            res.writeHead(200, { "Content-Type": "text/css" });
            let file = await fs.readFile(path.join(__dirname, "public", "css.css"));
            res.end(file);
        } 
        // API ВАКАНСІЙ
        else if (req.url === "/api/jobs" && req.method === "GET") {
            try {
                const response = await fetch("https://findwork.dev/api/jobs/", {
                    headers: {
                        "Authorization": "Token 698c2a8a04ad534e1662a5f84caf36b1b34f9007"
                    }
                });

                if (!response.ok) {
                    console.error(`API Findwork повернуло статус: ${response.status}`);
                    res.writeHead(response.status, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "API Findwork відхилило запит хостингу" }));
                    return;
                }

                const data = await response.json();
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(data));
            } catch (apiError) {
                console.error("Помилка запиту до стороннього API:", apiError);
                res.writeHead(502, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Не вдалося зв'язатися з API вакансій" }));
            }
        } 
        // Все інше — 404
        else {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Not Found / Не знайдено");
        }

    } catch (fileError) {
        // Якщо файлу немає в папочці public, сервер НЕ впаде, а просто чемно відповість помилкою 500
        console.error("Критична помилка файлової системи сервера:", fileError);
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Внутрішня помилка сервера. Перевірте наявність файлів у папці public.");
    }
});

server.listen(PORT, () => {
    console.log(`Сервер успішно запущено на порту: ${PORT}`);
});