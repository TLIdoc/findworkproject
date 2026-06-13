import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const PORT = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // 1. ГОЛОВНА СТОРІНКА
    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        let file = await fs.readFile(path.join(__dirname, "public", "index.html"));
        res.end(file);
        return; // <--- Зупиняємо виконання!
    }
    
    // 2. СТОРІНКА НАЛАШТУВАНЬ
    if (req.url === "/settings" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        let file = await fs.readFile(path.join(__dirname, "public", "settings.html"));
        res.end(file);
        return; // <--- Зупиняємо виконання!
    }

    // 3. СТОРІНКА ПРО НАС
    if (req.url === "/about" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        let file = await fs.readFile(path.join(__dirname, "public", "about.html"));
        res.end(file);
        return; // <--- Переконайся, що цей return на місці!
    }

    // 4. СКРИПТИ
    if (req.url === "/script.js" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        let file = await fs.readFile(path.join(__dirname, "public", "script.js"));
        res.end(file);
        return; // <--- Зупиняємо виконання!
    }

    // 5. СТИЛІ
    if (req.url === "/css.css" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/css" });
        let file = await fs.readFile(path.join(__dirname, "public", "css.css"));
        res.end(file);
        return; // <---布局 Зупиняємо виконання!
    } 
    
    // 6. API ВАКАНСІЙ
    if (req.url === "/api/jobs" && req.method === "GET") {
        try {
            const response = await fetch("https://findwork.dev/api/jobs/", {
                headers: {
                    "Authorization": "Token 698c2a8a04ad534e1662a5f84caf36b1b34f9007"
                }
            });
            const data = await response.json();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
            return; 
        } catch (error) {
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Помилка сервера при завантаженні вакансій");
            return;
        }
    }

    // 7. ДЕФОЛТНИЙ ПЕРЕХІД (ЯКЩО ЖОДЕН МАРШРУТ НЕ ПІДІЙШОВ)
    // Рядок 68 скоріш за все був тут. Якщо вище не спрацював return, код падав сюди!
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Сторінку не знайдено (404)");
});

server.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:3000`);
});