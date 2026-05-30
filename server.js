import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const server = http.createServer(async (req, res) => {
    try {
        if (req.url === "/") {
            const html = await fs.readFile(path.join(__dirname, "index.html"));
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
        } 
        else if (req.url === "/script.js") {
            const js = await fs.readFile(path.join(__dirname, "script.js"));
            res.writeHead(200, { "Content-Type": "application/javascript" });
            res.end(js);
        }
        else if (req.url === "/api/jobs") {
            const response = await fetch("https://findwork.dev/api/jobs/", {
                headers: { "Authorization": "Token 698c2a8a04ad534e1662a5f84caf36b1b34f9007" }
            });
            const data = await response.json();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
        }
        else {
            res.writeHead(404);
            res.end("Not Found");
        }
    } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end("Server Error");
    }
});

server.listen(PORT, () => console.log(`Сервер працює на http://localhost:${PORT}`));