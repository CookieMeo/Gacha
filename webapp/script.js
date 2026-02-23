const tg = window.Telegram.WebApp;
const uid = tg.initDataUnsafe.user?.id || 12345;

// --- КОНСТАНТЫ ---
const UPGRADE_COSTS = {
    2: [10, 2], 3: [40, 3], 4: [90, 4], 5: [160, 5], 6: [250, 6], 
    7: [360, 7], 8: [490, 8], 9: [640, 9], 10: [810, 10], 11: [4000, 100]
};

const BUY_SPINS_COST = { 1: 100, 5: 500, 10: 1000, 40: 4000, 100: 10000 };

// !!! ЗАМЕНИ НА ПРАВИЛЬНЫЕ ПУТИ К ТВОИМ ГИФКАМ !!!
const GIFS = {
    "Красное": "assets/red.gif",
    "Оранжевое": "assets/orange.gif",
    "Жёлтое": "assets/yellow.gif",
    "Зеленое": "assets/green.gif",
    "Голубое": "assets/lightblue.gif",
    "Синее": "assets/blue.gif",
    "Фиолетовое": "assets/purple.gif",
    "default": "assets/purple.gif"
};

// --- API ЗАПРОСЫ ---
async function api(path, body) {
    try {
        const r = await fetch('/api' + path, {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        return await r.json();
    } catch (e) { 
        console.error(`Ошибка API (${path}):`, e);
        return { success: false }; 
    }
}

// --- ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
async function updateUI() {
    const u = await api('/get_user', { user_id: uid });
    if (!u) return;

    // Обновляем ТЕКСТОВЫЕ значения
    const setT = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };
    
    setT('straw-count', u.strawberry);
    setT('gacha-straw', u.strawberry);
    setT('spin-count', u.spins);
    setT('lvl-display', "Уровень " + u.click_level);
    
    // Обновляем гаранты
    setT('p-red', u.pity_red);
    setT('p-orange', u.pity_orange); // <-- Добавил остальные гаранты
    setT('p-yellow', u.pity_yellow);
    setT('p-green', u.pity_green);
    setT('p-lightblue', u.pity_lightblue);
    setT('p-blue', u.pity_blue);

    // Кнопка улучшения
    const upBtn = document.getElementById('upgrade-btn');
    if (upBtn) {
        const cost = UPGRADE_COSTS[u.click_level + 1]?.[0]; // Получаем цену
        if (cost !== undefined) {
            upBtn.innerText = `Улучшить (${cost} 🍓)`;
            upBtn.disabled = false;
        } else {
            upBtn.innerText = "Макс. уровень";
            upBtn.disabled = true;
        }
    }
    
    // Обновляем ВСЮ статистику
    const setStats = (id, val) => {
        if(document.getElementById(id)) document.getElementById(id).innerText = val;
    };
    setStats('stat-pets-obtained', u.total_pets_obtained);
    setStats('stat-clicks', u.total_clicks);
    setStats('stat-spent', u.total_spent);
    setStats('stat-spins-bought', u.total_spins_bought);
    setStats('stat-gacha-pulls', u.total_gacha_pulls);
    // winrate пока 0
    setStats('stat-winrate-gacha', (u.total_pets_obtained / u.total_gacha_pulls * 100).toFixed(1) + "%");
    setStats('stat-winrate-battle', "0.0%");

    // Если открыта страница "Дом", обновляем инвентарь
    if (document.getElementById('home').classList.contains('active')) {
        updateInventory();
    }
}

// --- ОБНОВЛЕНИЕ ИНВЕНТАРЯ ---
async function updateInventory() {
    const items = await api('/get_inventory', { user_id: uid });
    const grid = document.getElementById('inventory-grid');
    if (!grid || !items) return;
    
    grid.innerHTML = "";
    if (items.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/3; text-align: center; color: gray;">Тут пока пусто</p>`;
        return;
    }
    
    items.forEach((item, index) => {
        // Добавляем 'skill-text' для навыка, но пока скрытый
        grid.innerHTML += `
            <div class="pet-item ${item.pet_rarity}">
                <img src="${item.pet_image || 'assets/strawberry.png'}">
                <p><b>${item.pet_name}</b></p>
                <small>${item.pet_rarity}</small>
                <!-- <p class="skill-text">${item.pet_skill}</p> -->
            </div>
        `;
    });
}

// --- ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ И НАВИГАЦИЯ ---
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active-nav'));
    const activeBtn = document.getElementById(id + '-btn');
    if (activeBtn) activeBtn.classList.add('active-nav');

    updateUI(); // Обновляем данные при смене страницы
}

// --- ГАЧА: КРУТКИ И АНИМАЦИЯ ---
async function spin(count) {
    console.log(`Кручу гачу x${count}`);
    const res = await api('/spin', { user_id: uid, count: count });
    
    if (!res.success) {
        console.error("Ошибка гачи:", res.error);
        return alert(res.error || "Ошибка при крутке");
    }

    const mainPet = res.pets[0]; // Берем первого питомца для гифки
    const overlay = document.getElementById('gacha-overlay');
    const animBox = document.getElementById('anim-box');
    const resCard = document.getElementById('res-card');
    
    overlay.classList.remove('hidden');
    resCard.classList.add('hidden');
    animBox.classList.remove('hidden');
    
    const gifSrc = GIFS[mainPet.rarity] || GIFS.default;
    console.log(`Анимация для ${mainPet.rarity}: ${gifSrc}`);
    document.getElementById('gacha-gif').src = gifSrc;

    // Через 5 секунд показываем результат
    setTimeout(() => {
        animBox.classList.add('hidden');
        resCard.classList.remove('hidden');
        
        document.getElementById('res-img').src = mainPet.image_url || 'assets/strawberry.png';
        document.getElementById('res-name').innerText = mainPet.name;
        document.getElementById('res-rarity').innerText = mainPet.rarity;
        
        updateUI(); // Обновляем счетчики
    }, 5000); // 5 секунд анимации
}

function closeGacha() {
    document.getElementById('gacha-overlay').classList.add('hidden');
}

// --- ПОКУПКА КРУТОК ---
async function buy(count) {
    const cost = BUY_SPINS_COST[count];
    if (!cost) return alert("Неверное количество");
    
    const res = await api('/buy', { user_id: uid, count: count });
    if (res.success) {
        updateUI(); // Обновляем отображение клубники и круток
    } else {
        alert("Недостаточно клубники!");
    }
}

// --- УЛУЧШЕНИЕ КЛИКЕРА ---
async function upgradeClicker() {
    const res = await api('/upgrade', { user_id: uid });
    if (res.success) {
        updateUI();
    } else {
        alert("Мало клубники или достигнут макс. уровень!");
    }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    tg.expand();
    
    // Навигация
    document.getElementById('home-btn').onclick = () => showPage('home');
    document.getElementById('gacha-btn').onclick = () => showPage('gacha');
    document.getElementById('game-btn').onclick = () => showPage('game');
    document.getElementById('profile-btn').onclick = () => showPage('profile');

    // Кнопки игры
    const collectBtn = document.getElementById('collect-btn');
    if(collectBtn) collectBtn.onclick = async () => {
        await api('/click', { user_id: uid });
        updateUI();
    };

    const upgradeBtn = document.getElementById('upgrade-btn');
    if(upgradeBtn) upgradeBtn.onclick = upgradeClicker;

    // Кнопки гачи
    if(document.getElementById('spin-1')) document.getElementById('spin-1').onclick = () => spin(1);
    if(document.getElementById('spin-10')) document.getElementById('spin-10').onclick = () => spin(10);

    // Кнопки покупки круток
    document.querySelectorAll('.shop button').forEach(btn => {
        const count = parseInt(btn.innerText.split('(')[0].replace('+','').trim());
        if (!isNaN(count)) {
            btn.onclick = () => buy(count);
        }
    });

    updateUI(); // Первоначальное обновление интерфейса
});
