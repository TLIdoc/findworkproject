const container = document.getElementById("jobs-container");

async function loadJobs() {
    try {
        const response = await fetch("http://localhost:3000/api/jobs");
        const data = await response.json();
        const jobs = data.results;

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