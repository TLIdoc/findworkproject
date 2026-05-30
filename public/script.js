fetch("/api/jobs")
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("jobs-container");
        container.innerHTML = data.results.map(job => `
            <div>
                <h3>${job.role}</h3>
                <p>${job.company_name}</p>
            </div>
        `).join("");
    })
    .catch(() => {
        document.getElementById("jobs-container").innerText = "Помилка завантаження";
    });