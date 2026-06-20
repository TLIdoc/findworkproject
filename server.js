import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// 1. ВИПРАВЛЕНО: Динамічний порт для Render
const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // Головна сторінка
    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        let file = await fs.readFile(path.join(__dirname, "public", "index.html"));
        res.end(file);
        return;
    }
    
    // СТОРІНКА НАЛАШТУВАНЬ
    if (req.url === "/settings" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        let file = await fs.readFile(path.join(__dirname, "public", "settings.html"));
        res.end(file);
        return;
    }
    if (req.url === "/about" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        let file = await fs.readFile(path.join(__dirname, "public", "about.html"));
        res.end(file);
        return;
    }

    if (req.url === "/script.js" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        let file = await fs.readFile(path.join(__dirname, "public", "script.js"));
        res.end(file);
        return;
    }
    if (req.url === "/css.css" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/css" });
        let file = await fs.readFile(path.join(__dirname, "public", "css.css"));
        res.end(file);
        return;
    } else if (req.url === "/api/jobs" && req.method === "GET") {
        try {
            const response = await fetch("https://findwork.dev/api/jobs/", {
                headers: {
                    "Authorization": "Token 698c2a8a04ad534e1662a5f84caf36b1b34f9007"
                }
            });

            // Перевіряємо, чи стороннє API не заблокувало наш Render-сервер
            if (!response.ok) {
                console.error(`API повернуло помилку: ${response.status} ${response.statusText}`);
                res.writeHead(response.status, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "API Findwork відхилило запит хостингу" }));
                return;
            }

            const data = await response.json();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
        } catch (error) {
            // Виводимо повну помилку в консоль Рендера, щоб ти міг її прочитати в панелі керування
            console.error("Критична помилка сервера:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Помилка при отриманні вакансій" }));
        }
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

server.listen(PORT, () => {
    console.log(`Сервер працює на порту: ${PORT}`);
});