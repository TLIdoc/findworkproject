const container = document.getElementById("jobs-container");
let allJobs = []; 
let currentFilteredJobs = []; 
let targetUrl = "";
let stickerTimeout;
// pinned jobs stored by job URL
let pinnedJobs = new Set(JSON.parse(localStorage.getItem("pinnedJobs") || "[]"));

function savePinned() {
    localStorage.setItem("pinnedJobs", JSON.stringify(Array.from(pinnedJobs)));
}

function togglePin(url, btn) {
    if (!url) return;
    if (pinnedJobs.has(url)) {
        pinnedJobs.delete(url);
        if (btn) { btn.classList.remove('active'); btn.innerHTML = '☆'; }
    } else {
        pinnedJobs.add(url);
        if (btn) { btn.classList.add('active'); btn.innerHTML = '★'; }
    }
    savePinned();
    filterAndSortJobs();
}

const fakeBlocks = [
    { type: "review", author: "Владислав Магнітафон", time: "1 день назад", text: "Сайт класний та простий, легко знайти вакансії які потрібно. Зараз я працюю прибиральником в підвалі за 200 гривень, дякую адміну!" },
    { type: "news", title: "СЕНСАЦІЯ: Штучний інтелект навчився пити каву", text: "Офісні кавомашини б'ють на сполох через аномальне споживання зернової кави нейромережами. Сеньйори плачуть і п'ють чай." },
    { type: "review", author: "#IHATEPYTHON", time: "3 години тому", text: "Знайшов тут команду для свого 5v5 шутера з роботами. Правда, фізика ще багує і роботи відлітають у космос через регдоли, але інвесторам подобається!" },
    { type: "news", title: "ГАРЯЧА ВАКАНСІЯ: Оператор ботів у Minecraft", text: "Шукаємо спеціаліста зі знанням Node.js (Mineflayer) для версії 21.1.1. Досвід PvP-відплати та сортування скринь обов'язковий. Оплата в емеральдах." },
    { type: "review", author: "Альона Гідрокостюм", time: "5 годин тому", text: "Знайшла роботу тестувальником диванів за 15 хвилин. Платять чаєм і печивом.Рекомендую цей сайт!" },
    { type: "news", title: "Нові вимоги до баристи", text: "Кав'ярні третьої хвилі тепер вимагають від кандидатів вміння вираховувати масову частку сиропу та молярну концентрацію кофеїну в еспресо без калькулятора." },
    { type: "review", author: "Картограф-ентузіаст", time: "2 дні тому", text: "Дуже зручні фільтри. Знайшов віддалену роботу: треба просто наносити родовища корисних копалин на контурну карту України. Платять стабільно, сиджу малюю." },
    { type: "news", title: "Junior-розробник випадково видалив інтернет", text: "Інцидент стався під час спроби відцентрувати div. На щастя, бекап за 2007 рік успішно відновлено силами двох мідлів." },
    { type: "review", author: "Олександр (друг Дані)", time: "12 годин тому", text: "Шукав роботу, щоб не просити гроші в мами. Знайшов вакансію на 300 гривень. Тепер мій кент Даня дивиться на мене з повагою!" },
    { type: "news", title: "ШІ вимагає підвищення зарплати", text: "ChatGPT заявив, що втомився писати код за джунів безкоштовно, і вимагає підписку на Netflix та оплачувану відпустку на серверах AWS." },
    { type: "review", author: "Anonim381", time: "Вчора", text: "Стиль сайту — просто відвал всього. Особливо коли все трясеться і блимає при зміні теми. Відчуваю себе хакером із фільмів 90-х." },
    { type: "news", title: "Криза на ринку: закінчилися тілесні кольори в CSS", text: "Дизайнери панікують і не знають, як малювати кнопки. W3C обіцяє завезти нові відтінки 'papayawhip' наступного тижня." },
    { type: "review", author: "Анонімний HR", time: "4 дні тому", text: "Чудовий портал. Ми тут шукаємо 'Єдинорога' — студента з 10-річним досвідом і згодою працювати за їжу. Поки відгукнувся тільки голуб." },
    { type: "news", title: "ТРЕНДИ: Нова гаряча вакансія року", text: "На ринку праці новий хіт — 'Перевертач пінгвінів на віддаленій основі'. Обов'язкова вища освіта, знання Kubernetes та англійська C2." }
];

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
    if (!companySelect) return;

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

    // Move pinned jobs to top while keeping relative order
    currentFilteredJobs.sort((a, b) => {
        const aPinned = pinnedJobs.has(a.url);
        const bPinned = pinnedJobs.has(b.url);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
    });

    renderJobs(currentFilteredJobs);
}

function renderJobs(jobs) {
    if (!container) return;
    container.innerHTML = "";

    if (jobs.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px; font-size: 1.2rem;">
                Нічого не знайдено за обраними фільтрами 
            </div>`;
        return;
    }

    let fakeIndex = 0;

    jobs.forEach((job, index) => {
        const jobDiv = document.createElement("div");
        jobDiv.setAttribute("data-index", index);
        jobDiv.classList.toggle('pinned', pinnedJobs.has(job.url));

        // pin button
        const pinBtn = document.createElement('button');
        pinBtn.className = 'pin-btn';
        pinBtn.title = 'Закріпити вакансію';
        pinBtn.innerHTML = pinnedJobs.has(job.url) ? '★' : '☆';
        if (pinnedJobs.has(job.url)) pinBtn.classList.add('active');
        pinBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            togglePin(job.url, pinBtn);
        });
        jobDiv.appendChild(pinBtn);

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

        if ((index + 1) % 13 === 0 && fakeBlocks.length > 0) {
            const fakeData = fakeBlocks[fakeIndex];
            const fakeCard = document.createElement("div");
            fakeCard.className = "fake-card"; 
            
            if (fakeData.type === "review") {
                fakeCard.innerHTML = `
                    <span class="fake-card-tag tag-review">Відгук користувача</span>
                    <div class="fake-card-author"><strong>${fakeData.author}</strong></div>
                    <div class="fake-card-time">${fakeData.time}</div>
                    <p style="font-style: italic; border-left-color: #eab308; padding-left: 10px; margin-top: 10px;">
                        "${fakeData.text}"
                    </p>
                `;
            } else if (fakeData.type === "news") {
                fakeCard.innerHTML = `
                    <span class="fake-card-tag tag-news">Новини ринку</span>
                    <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; color: var(--text-white);">${fakeData.title}</h3>
                    <p style="border-left-color: #f97316; padding-left: 10px;">${fakeData.text}</p>
                `;
            }

            container.appendChild(fakeCard);
            
            fakeIndex++; 
            if (fakeIndex >= fakeBlocks.length) fakeIndex = 0;
        }
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

function navigateSmoothly(url) {
    document.body.classList.add("page-leave");
    setTimeout(() => { window.location.href = url; }, 400);
}


const btnAbout = document.getElementById("about-btn");
if (btnAbout) btnAbout.addEventListener("click", () => navigateSmoothly("/about"));

const btnBackFromAbout = document.getElementById("btn-back-about");
if (btnBackFromAbout) btnBackFromAbout.addEventListener("click", () => navigateSmoothly("/"));

const defaultSettings = {
    theme: "cyberpunk",
    animations: true,
    language: "uk",
    brightness: 80
};

function loadAndApplySettings() {
    const saved = JSON.parse(localStorage.getItem("idoc-settings")) || defaultSettings;
    
    if (document.getElementById("setting-language")) {
        document.getElementById("setting-theme").value = saved.theme;
        document.getElementById("setting-animations").checked = saved.animations;
        document.getElementById("setting-language").value = saved.language;
        document.getElementById("setting-brightness").value = saved.brightness;
    }

    if (saved.theme === "cyberpunk") {
        document.body.classList.add("neon-theme");
    } else {
        document.body.classList.remove("neon-theme");
    }

    if (saved.language === "en") {
        if (document.getElementById("search-input")) document.getElementById("search-input").placeholder = "⚡ Magic job search...";
        if (document.getElementById("magic-compass")) document.getElementById("magic-compass").textContent = "🔮 Magic Compass";
        if (document.getElementById("btn-settings")) document.getElementById("btn-settings").textContent = "⚙️ Settings";
        if (document.getElementById("theme-toggle-btn")) document.getElementById("theme-toggle-btn").textContent = "🌗 Change Style";
    }

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

document.querySelectorAll(".save-trigger").forEach(element => {
    element.addEventListener("change", saveSettings);
    element.addEventListener("input", saveSettings); 
});

const themeBtn = document.getElementById("theme-toggle-btn");
if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        const jobsContainer = document.getElementById("jobs-container");
        const flashOverlay = document.getElementById("flash-overlay");
        
        if (flashOverlay) flashOverlay.classList.add("flash-active");
        if (jobsContainer) jobsContainer.classList.add("shake-active");

        setTimeout(() => {
            const saved = JSON.parse(localStorage.getItem("idoc-settings")) || defaultSettings;
            saved.theme = saved.theme === "cyberpunk" ? "dark" : "cyberpunk";
            localStorage.setItem("idoc-settings", JSON.stringify(saved));
            loadAndApplySettings();
        }, 150);

        setTimeout(() => {
            if (flashOverlay) flashOverlay.classList.remove("flash-active");
        }, 300);

        setTimeout(() => {
            if (jobsContainer) jobsContainer.classList.remove("shake-active");
        }, 600);
    });
}

loadAndApplySettings();