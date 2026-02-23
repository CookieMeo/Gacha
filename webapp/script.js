
const tg = window.Telegram.WebApp;
const user = tg.initDataUnsafe.user;
const uid = user?.id || 12345; // Убедитесь, что здесь есть дефолтный ID для отладки, если WebApp не в ТГ

async function api(path, data) {
    const res = await fetch('https://gacha-iifj.onrender.com/api' + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

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

// --- Обновление UI ---
async function updateUI() {
    const u = await api('/get_user', { user_id: uid });
    if (u && u.user_id) { // Проверяем, что пользователь найден
        document.getElementById('strawberry-count').innerText = u.strawberry;
        document.getElementById('spins-count').innerText = u.spins;
        document.getElementById('level-display').innerText = u.click_level;
        document.getElementById('upgrade-btn').innerText = `Улучшить (${u.click_level === 11 ? 'МАКС' : UPGRADE_COSTS[u.click_level + 1][0]})`;

        // Обновление имени и аватарки в профиле (если есть данные из Telegram)
        document.getElementById('profile-username').innerText = user?.first_name || u.username || "Игрок";
        if (user?.photo_url) {
            document.getElementById('profile-avatar').src = user.photo_url;
        } else {
            // Можно поставить дефолтную, если нет ТГ-аватарки
            document.getElementById('profile-avatar').src = 'assets/default_avatar.png'; 
        }

        // Статистика
        const totalRedPulls = u.red_wins + u.red_losses;
        const winrate = totalRedPulls > 0 ? ((u.red_wins / totalRedPulls) * 100).toFixed(1) : 0;
        document.getElementById('stat-winrate-gacha').innerText = `${winrate}%`;
        
        const avgPulls = u.red_count > 0 ? (u.total_pulls_for_avg_red / u.red_count).toFixed(1) : 0;
        document.getElementById('stat-avg-red').innerText = avgPulls;

        document.getElementById('stat-spent-straw').innerText = u.spent_strawberry;
        document.getElementById('stat-spent-spins').innerText = u.spent_spins;

    } else {
        console.error("Не удалось получить данные пользователя.");
        // Можно вывести сообщение об ошибке или перенаправить на страницу регистрации
    }
}

// --- КЛИКЕР ---
async function clickStrawberry() {
    const res = await api('/click', { user_id: uid });
    if (res.success) {
        updateUI();
    } else {
        alert(res.error || "Ошибка при клике");
    }
}

// --- УЛУЧШЕНИЕ ---
const UPGRADE_COSTS = {
    1: [0, 1], 2: [10, 2], 3: [40, 3], 4: [90, 4], 5: [160, 5], 
    6: [250, 6], 7: [360, 7], 8: [490, 8], 9: [640, 9], 10: [810, 10], 11: [4000, 100]
};
async function upgradeClicker() {
    const res = await api('/upgrade', { user_id: uid });
    if (res.success) {
        updateUI();
    } else {
        alert(res.error || "Неизвестная ошибка при улучшении!");
    }
}

// --- ГАЧА ---
let currentBanner = 1; // 1 - Феникс, 2 - Единорог
function setBanner(id) {
    currentBanner = id;
    document.querySelectorAll('.banner-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('banner-'+id).classList.add('active');
}

async function buySpins(count) {
    const res = await api('/buy', { user_id: uid, count: count });
    if (res.success) {
        updateUI();
    } else {
        alert(res.error || "Недостаточно клубники для покупки круток!");
    }
}

async function spin(count) {
    const res = await api('/spin', { user_id: uid, count: count, banner_id: currentBanner });
    
    if (!res.success) {
        alert(res.error || "Ошибка при крутке!");
        updateUI(); // Обновим UI, чтобы показать актуальное количество круток
        return;
    }

    if (!res.pets || res.pets.length === 0) {
        alert("Не удалось получить питомца.");
        updateUI();
        return;
    }

    const mainPet = res.pets[0]; // Берем первого питомца (для анимации)
    
    const overlay = document.getElementById('gacha-overlay');
    overlay.classList.remove('hidden');
    document.getElementById('res-card').classList.add('hidden');
    document.getElementById('anim-box').classList.remove('hidden');
    
    document.getElementById('gacha-gif').src = GIFS[mainPet.rarity] || GIFS.default;

    setTimeout(() => {
        document.getElementById('anim-box').classList.add('hidden');
        document.getElementById('res-card').classList.remove('hidden');
        document.getElementById('res-img').src = mainPet.image_url;
        document.getElementById('res-name').innerText = mainPet.name;
        document.getElementById('res-rarity').innerText = mainPet.rarity;
        updateUI(); // Обновляем UI после получения питомца
    }, 5000); 
}

// --- ПРОМОКОДЫ ---
async function claimPromo() {
    const code = document.getElementById('promo-input').value;
    const res = await api('/claim_promo', { user_id: uid, code: code });
    if (res.success) {
        alert(res.msg);
    } else {
        alert(res.error || "Ошибка при активации промокода");
    }
    updateUI();
}

// --- КОЛЛЕКЦИЯ ---
async function openCollection() {
    const allPetsRaw = await api('/get_all_pets', {});
    const myItemsRaw = await api('/get_inventory', { user_id: uid });

    // Преобразуем список всех питомцев в удобный формат
    const allPets = allPetsRaw.map(p => ({
        name: p.name,
        rarity: p.rarity,
        image_url: p.image_url,
        is_event: p.is_event,
        skill: p.skill
    }));
    
    const myPetNames = new Set(myItemsRaw.map(i => i.pet_name)); // Быстрый поиск
    
    const grid = document.getElementById('collection-grid');
    grid.innerHTML = "";
    
    allPets.forEach(p => {
        const isHave = myPetNames.has(p.name);
        grid.innerHTML += `
            <div class="coll-item ${isHave ? '' : 'gray'}">
                <img src="${p.image_url}" alt="${p.name}">
                <p><b>${p.name}</b></p>
                <small>${p.rarity}</small>
            </div>
        `;
    });
    document.getElementById('collection-overlay').classList.remove('hidden');
}


// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});
