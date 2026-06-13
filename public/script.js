// ================= 1. ГЛОБАЛЬНІ ЗМІННІ =================
const container = document.getElementById("jobs-container");
let allJobs = []; 
let currentFilteredJobs = []; 
let targetUrl = "";
let stickerTimeout;

// ================= 2. ЛОГІКА ВАКАНСІЙ (ТІЛЬКИ ДЛЯ ГОЛОВНОЇ СТОРІНКИ) =================
if (container) {
    loadJobs();
}

async function loadJobs() {
    try {
        const response = await fetch("http://localhost:3000/api/jobs");
        const data = await response.json();
        allJobs = data.results || [];
        
        populateFilters(allJobs);
        filterAndSortJobs();
    } catch (error) {
        if (container) container.textContent = "Помилка при завантаженні даних з сервера";
    }
}

function populateFilters(jobs) {
    const companySelect = document.getElementById("company-filter");
    if (!companySelect) return; // Якщо ми в налаштуваннях — припиняємо виконання

    const companies = new Set();
    const locations = new Set();
    const employments = new Set();
    const keywords = new Set();

    jobs.forEach(job => {
        if (job.company_name) companies.add(job.company_name);
        if (job.location) locations.add(job.location);
        if (job.employment_type) employments.add(job.employment_type);
        if (job.keywords) job.keywords.forEach(k => keywords.add(k));
    });

    companies.forEach(c => companySelect.innerHTML += `<option value="${c}">🏢 ${c}</option>`);
    
    const locationSelect = document.getElementById("location-filter");
    if (locationSelect) locations.forEach(l => locationSelect.innerHTML += `<option value="${l}">📍 ${l}</option>`);

    const employmentSelect = document.getElementById("employment-filter");
    if (employmentSelect) employments.forEach(e => employmentSelect.innerHTML += `<option value="${e}">💼 ${e}</option>`);

    const keywordSelect = document.getElementById("keyword-filter");
    if (keywordSelect) Array.from(keywords).sort().forEach(k => keywordSelect.innerHTML += `<option value="${k}">🏷️ ${k}</option>`);
}

function filterAndSortJobs() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    const searchQuery = searchInput.value.toLowerCase();
    const companyVal = document.getElementById("company-filter").value;
    const locationVal = document.getElementById("location-filter").value;
    const remoteVal = document.getElementById("remote-filter").value;
    const employmentVal = document.getElementById("employment-filter").value;
    const keywordVal = document.getElementById("keyword-filter").value;
    const sortDateVal = document.getElementById("sort-date").value;

    currentFilteredJobs = allJobs.filter(job => {
        const matchesSearch = job.role && job.role.toLowerCase().includes(searchQuery);
        const matchesCompany = companyVal === "all" || job.company_name === companyVal;
        const matchesLocation = locationVal === "all" || job.location === locationVal;
        const matchesEmployment = employmentVal === "all" || job.employment_type === employmentVal;
        const matchesKeyword = keywordVal === "all" || (job.keywords && job.keywords.includes(keywordVal));
        
        let matchesRemote = true;
        if (remoteVal === "remote") matchesRemote = job.remote === true;
        if (remoteVal === "office") matchesRemote = job.remote === false;

        return matchesSearch && matchesCompany && matchesLocation && matchesRemote && matchesEmployment && matchesKeyword;
    });

    currentFilteredJobs.sort((a, b) => {
        const dateA = new Date(a.date_posted || 0);
        const dateB = new Date(b.date_posted || 0);
        return sortDateVal === "newest" ? dateB - dateA : dateA - dateB;
    });

    renderJobs(currentFilteredJobs);
}

function renderJobs(jobs) {
    if (!container) return;
    container.innerHTML = "";

    if (jobs.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px; font-size: 1.2rem;">
                Нічого не знайдено за обраними фільтрами 😢
            </div>`;
        return;
    }

    jobs.forEach((job, index) => {
        const jobDiv = document.createElement("div");
        jobDiv.setAttribute("data-index", index);

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

        const formattedDate = job.date_posted ? new Date(job.date_posted).toLocaleDateString("uk-UA") : "Не вказано";
        const date = document.createElement("p");
        date.textContent = "Дата додавання: " + formattedDate;
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

        link.addEventListener("click", (e) => {
            e.preventDefault(); 
            targetUrl = job.url; 
            const modal = document.getElementById("confirm-modal");
            if (modal) modal.classList.add("active");
            
            stickerTimeout = setTimeout(() => {
                const sticker = document.getElementById("sticker-idoc");
                if (sticker) sticker.classList.add("fly-in");
            }, 2000);
        });

        jobDiv.appendChild(link);
        jobDiv.appendChild(document.createElement("hr"));
        container.appendChild(jobDiv);
    });
}

const magicCompass = document.getElementById("magic-compass");
if (magicCompass) {
    magicCompass.addEventListener("click", () => {
        if (currentFilteredJobs.length === 0) return;
        document.querySelectorAll("#jobs-container > div").forEach(el => el.classList.remove("magic-destiny-card"));
        
        const randomIndex = Math.floor(Math.random() * currentFilteredJobs.length);
        const destinyCard = document.querySelector(`[data-index="${randomIndex}"]`);
        
        if (destinyCard) {
            destinyCard.scrollIntoView({ behavior: "smooth", block: "center" });
            destinyCard.classList.add("magic-destiny-card");
        }
    });
}

function triggerFlash(e) {
    e.target.classList.add("select-flash");
    setTimeout(() => e.target.classList.remove("select-flash"), 600);
    filterAndSortJobs();
}

const searchInputDOM = document.getElementById("search-input");
if (searchInputDOM) searchInputDOM.addEventListener("input", filterAndSortJobs);

["company-filter", "location-filter", "remote-filter", "employment-filter", "keyword-filter", "sort-date"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", triggerFlash);
});

window.addEventListener("scroll", () => {
    const panel = document.getElementById("floating-panel");
    if (panel) {
        if (window.scrollY > 50) panel.classList.add("scrolled");
        else panel.classList.remove("scrolled");
    }
});

function closeModal() {
    const modal = document.getElementById("confirm-modal");
    const sticker = document.getElementById("sticker-idoc");
    if (modal) modal.classList.remove("active");
    if (sticker) sticker.classList.remove("fly-in");
    clearTimeout(stickerTimeout);
}

const modalCancel = document.getElementById("modal-cancel");
if (modalCancel) modalCancel.addEventListener("click", closeModal);

const modalConfirm = document.getElementById("modal-confirm");
if (modalConfirm) modalConfirm.addEventListener("click", () => {
    if (targetUrl) window.open(targetUrl, "_blank");
    closeModal();
});

// ================= 3. ЛОГІКА ПЕРЕХОДІВ =================
function navigateSmoothly(url) {
    document.body.classList.add("page-leave");
    setTimeout(() => { window.location.href = url; }, 400);
}

const btnSettings = document.getElementById("btn-settings");
if (btnSettings) btnSettings.addEventListener("click", () => navigateSmoothly("/settings"));

const btnBack = document.getElementById("btn-back");
if (btnBack) btnBack.addEventListener("click", () => navigateSmoothly("/"));

// ================= 4. ЗБЕРЕЖЕННЯ ТА ЗМІНА ТЕМИ =================
const defaultSettings = {
    theme: "cyberpunk", // або "dark"
    animations: true,
    language: "uk",
    brightness: 80
};

function loadAndApplySettings() {
    const saved = JSON.parse(localStorage.getItem("idoc-settings")) || defaultSettings;
    
    // Заповнюємо інпути в налаштуваннях (якщо ми там)
    if (document.getElementById("setting-language")) {
        document.getElementById("setting-theme").value = saved.theme;
        document.getElementById("setting-animations").checked = saved.animations;
        document.getElementById("setting-language").value = saved.language;
        document.getElementById("setting-brightness").value = saved.brightness;
    }

    // Вмикаємо або вимикаємо НЕОН
    if (saved.theme === "cyberpunk") {
        document.body.classList.add("neon-theme");
    } else {
        document.body.classList.remove("neon-theme");
    }

    // Переклад
    if (saved.language === "en") {
        if (document.getElementById("search-input")) document.getElementById("search-input").placeholder = "⚡ Magic job search...";
        if (document.getElementById("magic-compass")) document.getElementById("magic-compass").textContent = "🔮 Magic Compass";
        if (document.getElementById("btn-settings")) document.getElementById("btn-settings").textContent = "⚙️ Settings";
        if (document.getElementById("theme-toggle-btn")) document.getElementById("theme-toggle-btn").textContent = "🌗 Change Style";
    }

    // Анімації та яскравість
    if (!saved.animations) {
        document.body.style.animation = "none";
        if (document.getElementById("floating-panel")) document.getElementById("floating-panel").style.animation = "none";
    }
    document.body.style.opacity = saved.brightness / 100;
}

function saveSettings() {
    const settings = {
        theme: document.getElementById("setting-theme") ? document.getElementById("setting-theme").value : "cyberpunk",
        animations: document.getElementById("setting-animations") ? document.getElementById("setting-animations").checked : true,
        language: document.getElementById("setting-language") ? document.getElementById("setting-language").value : "uk",
        brightness: document.getElementById("setting-brightness") ? document.getElementById("setting-brightness").value : 80
    };
    localStorage.setItem("idoc-settings", JSON.stringify(settings));
    loadAndApplySettings(); 
}

// Прив'язка до елементів сторінки налаштувань
document.querySelectorAll(".save-trigger").forEach(element => {
    element.addEventListener("change", saveSettings);
    element.addEventListener("input", saveSettings); 
});

// ЕФЕКТ ЕПІЧНОЇ ЗМІНИ ТЕМИ (на головній сторінці)
const themeBtn = document.getElementById("theme-toggle-btn");
if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        const jobsContainer = document.getElementById("jobs-container");
        const flashOverlay = document.getElementById("flash-overlay");
        
        // 1. Врубаємо спалах і трясіння
        if (flashOverlay) flashOverlay.classList.add("flash-active");
        if (jobsContainer) jobsContainer.classList.add("shake-active");

        // 2. Через 150мс (на піку спалаху) міняємо тему
        setTimeout(() => {
            const saved = JSON.parse(localStorage.getItem("idoc-settings")) || defaultSettings;
            saved.theme = saved.theme === "cyberpunk" ? "dark" : "cyberpunk";
            localStorage.setItem("idoc-settings", JSON.stringify(saved));
            loadAndApplySettings();
        }, 150);

        // 3. Знімаємо спалах 
        setTimeout(() => {
            if (flashOverlay) flashOverlay.classList.remove("flash-active");
        }, 300);

        // 4. Знімаємо трясіння після закінчення анімації
        setTimeout(() => {
            if (jobsContainer) jobsContainer.classList.remove("shake-active");
        }, 600);
    });
}

// Запускаємо налаштування візуалу при завантаженні сторінки
loadAndApplySettings();