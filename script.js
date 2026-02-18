document.addEventListener('DOMContentLoaded', () => {
    // --- Telegram WebApp Initialization ---
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    if (Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
        console.log('Telegram User Data:', Telegram.WebApp.initDataUnsafe.user);
    }

    // --- DOM Elements ---
    const strawberryCountElem = document.getElementById('strawberry-count');

    const homeSection = document.getElementById('home-section');
    const gachaSection = document.getElementById('gacha-section');
    const gameSection = document.getElementById('game-section');
    const profileSection = document.getElementById('profile-section');

    const navHomeBtn = document.getElementById('nav-home');
    const navGachaBtn = document.getElementById('nav-gacha');
    const navGameBtn = document.getElementById('nav-game');
    const navProfileBtn = document.getElementById('nav-profile');
    const navButtons = [navHomeBtn, navGachaBtn, navGameBtn, navProfileBtn];

    const animalsGrid = document.getElementById('animals-grid');
    const noAnimalsMessage = document.getElementById('no-animals-message');

    const gachaSpinnerContainer = document.getElementById('gacha-spinner-container');
    const gachaSpinner = document.getElementById('gacha-spinner');
    const gachaAnimalImage = document.getElementById('gacha-animal-image');
    const gachaAnimalName = document.getElementById('gacha-animal-name');
    const gachaAnimalRarity = document.getElementById('gacha-animal-rarity');
    const spin1Btn = document.getElementById('spin-1-btn');
    const spin10Btn = document.getElementById('spin-10-btn');
    const pityList = document.getElementById('pity-list');

    const strawberryImage = document.getElementById('strawberry-image');
    const clickFeedback = document.getElementById('click-feedback');
    const clickerLevelElem = document.getElementById('clicker-level');
    const strawberriesPerClickElem = document.getElementById('strawberries-per-click');
    const upgradeClickerBtn = document.getElementById('upgrade-clicker-btn');
    const upgradeCostInfo = document.getElementById('upgrade-cost-info');

    const profileAvatar = document.getElementById('profile-avatar');
    const profileNickname = document.getElementById('profile-nickname');
    const profileLuck = document.getElementById('profile-luck');
    const profileTotalPets = document.getElementById('profile-total-pets');
    const profileStrawberriesSpent = document.getElementById('profile-strawberries-spent');
    const profileTotalClicks = document.getElementById('profile-total-clicks');
    const promoCodeInput = document.getElementById('promo-code-input');
    const activatePromoBtn = document.getElementById('activate-promo-btn');
    const promoMessage = document.getElementById('promo-message');

    // --- Game Data & Configuration ---
    const RARITIES = {
        'êðàñíîå': { chance: 0.005, name: 'Êðàñíîå (Ëåãåíäàðíîå)', color: 'red', pity: 40 },
        'îðàíæåâîå': { chance: 0.015, name: 'Îðàíæåâîå (Ýïè÷åñêîå)', color: 'orange', pity: 30 },
        'æåëòîå': { chance: 0.03, name: 'Æåëòîå (Ðåäêîå)', color: 'yellow', pity: 15 },
        'çåëåíîå': { chance: 0.08, name: 'Çåëåíîå (Íåîáû÷íîå)', color: 'green', pity: 10 },
        'ãîëóáîå': { chance: 0.15, name: 'Ãîëóáîå (Îñîáîå)', color: 'cyan', pity: 5 },
        'ñèíåå': { chance: 0.25, name: 'Ñèíåå (Îáû÷íîå+)', color: 'blue', pity: 3 },
        'ôèîëåòîâîå': { chance: 0.46, name: 'Ôèîëåòîâîå (Îáû÷íîå)', color: 'violet', pity: 0 } // No explicit pity for common
    };
    const BANNER_ANIMAL_ID = 'dragon_legendary'; // ID áàííåðíîãî æèâîòíîãî
    const GACHA_COST_PER_SPIN = 100;

    const ANIMALS = [
        // Êðàñíîå
        { id: 'dragon_legendary', name: 'Îãíåííûé Äðàêîí', rarity: 'êðàñíîå', image: 'https://cdn-icons-png.flaticon.com/512/3050/3050300.png' },
        { id: 'phoenix_legendary', name: 'Ôåíèêñ', rarity: 'êðàñíîå', image: 'https://cdn-icons-png.flaticon.com/512/3673/3673752.png' },
        { id: 'unicorn_legendary', name: 'Åäèíîðîã', rarity: 'êðàñíîå', image: 'https://cdn-icons-png.flaticon.com/512/1155/1155073.png' },
        // Îðàíæåâîå
        { id: 'griffin_epic', name: 'Ãðèôîí', rarity: 'îðàíæåâîå', image: 'https://cdn-icons-png.flaticon.com/512/2855/2855169.png' },
        { id: 'sphinx_epic', name: 'Ñôèíêñ', rarity: 'îðàíæåâîå', image: 'https://cdn-icons-png.flaticon.com/512/2165/2165039.png' },
        { id: 'minotaur_epic', name: 'Ìèíîòàâð', rarity: 'îðàíæåâîå', image: 'https://cdn-icons-png.flaticon.com/512/2165/2165037.png' },
        // Æåëòîå
        { id: 'wolf_rare', name: 'Ñíåæíûé Âîëê', rarity: 'æåëòîå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049282.png' },
        { id: 'fox_rare', name: 'Õèòðàÿ Ëèñà', rarity: 'æåëòîå', image: 'https://cdn-icons-png.flaticon.com/512/1070/1070220.png' },
        { id: 'owl_rare', name: 'Ìóäðûé Ôèëèí', rarity: 'æåëòîå', image: 'https://cdn-icons-png.flaticon.com/512/2619/2619721.png' },
        // Çåëåíîå
        { id: 'bear_uncommon', name: 'Áóðûé Ìåäâåäü', rarity: 'çåëåíîå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049286.png' },
        { id: 'deer_uncommon', name: 'Áëàãîðîäíûé Îëåíü', rarity: 'çåëåíîå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049272.png' },
        { id: 'rabbit_uncommon', name: 'Áûñòðûé Çàÿö', rarity: 'çåëåíîå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049266.png' },
        // Ãîëóáîå
        { id: 'dog_special', name: 'Âåðíûé Ï¸ñ', rarity: 'ãîëóáîå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049289.png' },
        { id: 'cat_special', name: 'Ãðàöèîçíûé Êîò', rarity: 'ãîëóáîå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049270.png' },
        { id: 'parrot_special', name: 'Ãîâîðÿùèé Ïîïóãàé', rarity: 'ãîëóáîå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049297.png' },
        // Ñèíåå
        { id: 'pig_common_plus', name: 'Âåñåëûé Ïîðîñ¸íîê', rarity: 'ñèíåå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049301.png' },
        { id: 'cow_common_plus', name: 'Ìèðíàÿ Êîðîâà', rarity: 'ñèíåå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049271.png' },
        { id: 'chicken_common_plus', name: 'Êóðèöà-íåñóøêà', rarity: 'ñèíåå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049268.png' },
        // Ôèîëåòîâîå
        { id: 'mouse_common', name: 'Ìàëåíüêàÿ Ìûøêà', rarity: 'ôèîëåòîâîå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049293.png' },
        { id: 'frog_common', name: 'Çåë¸íàÿ Ëÿãóøêà', rarity: 'ôèîëåòîâîå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049277.png' },
        { id: 'fish_common', name: 'Çîëîòàÿ Ðûáêà', rarity: 'ôèîëåòîâîå', image: 'https://cdn-icons-png.flaticon.com/512/2049/2049276.png' }
    ];

    const CLICKER_UPGRADE_COSTS = [
        0, // Óðîâåíü 1 (áåñïëàòíî)
        10, // Óðîâåíü 2
        40, // Óðîâåíü 3
        90, // Óðîâåíü 4
        160, // Óðîâåíü 5
        250, // Óðîâåíü 6
        360, // Óðîâåíü 7
        490, // Óðîâåíü 8
        640, // Óðîâåíü 9
        810  // Óðîâåíü 10
    ];

    // Ïðîìîêîäû (Â ðåàëüíîé àïïêå ýòî áóäåò íà ñåðâåðå)
    const PROMO_CODES = {
        "WELCOMEBONUS": { strawberries: 500, used: false, message: "Ïðèâåòñòâåííûé áîíóñ 500 êëóáíèê!" },
        "FREESPIN": { spins: 1, used: false, message: "Áåñïëàòíàÿ êðóòêà ïîëó÷åíà!" },
        "LUCKY2026": { strawberries: 1000, used: false, message: "Áîíóñ ê óäà÷íîìó ãîäó: 1000 êëóáíèê!" },
    };


    // --- User Data (persisted with localStorage) ---
    let userData = {
        strawberries: 0,
        animalsOwned: [], // Array of animal objects
        clickerLevel: 1,
        pityCounters: {}, // { 'êðàñíîå': 0, 'îðàíæåâîå': 0, ... }
        redGuaranteedBanner: true, // True if the next red guarantees banner animal
        stats: {
            totalClicks: 0,
            strawberriesSpent: 0,
            totalPets: 0,
            luckyPulls: 0, // Early pulls, not pity
            pityPulls: 0, // Pulls that activated pity
        },
        promoCodesUsed: {}, // { "CODE": true }
        userId: Telegram.WebApp.initDataUnsafe?.user?.id || 'guest_' + Math.random().toString(36).substring(2, 11), // Óíèêàëüíûé ID äëÿ ñîõðàíåíèÿ
        userName: Telegram.WebApp.initDataUnsafe?.user?.first_name || 'Èãðîê',
        userAvatar: `https://api.adorable-avatars.com/avatars/100/${Telegram.WebApp.initDataUnsafe?.user?.id || 'guest'}.png` // Ïðèìåð
    };

    // Initialize rarity pity counters
    for (const rarityKey in RARITIES) {
        userData.pityCounters[rarityKey] = 0;
    }

    // --- Functions for Data Management ---
    function saveUserData() {
        localStorage.setItem(`gachaAppUser_${userData.userId}`, JSON.stringify(userData));
    }

    function loadUserData() {
        const savedData = localStorage.getItem(`gachaAppUser_${userData.userId}`);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Merge loaded data, ensuring new fields are initialized if not present in old save
            userData = { ...userData, ...parsedData };
            // Ensure pityCounters has all current rarities, old saves might miss new ones
            for (const rarityKey in RARITIES) {
                if (userData.pityCounters[rarityKey] === undefined) {
                    userData.pityCounters[rarityKey] = 0;
                }
            }
            // Ensure redGuaranteedBanner is set correctly if missing
            if (userData.redGuaranteedBanner === undefined) {
                userData.redGuaranteedBanner = true;
            }
            // Ensure promoCodesUsed is an object
            if (typeof userData.promoCodesUsed !== 'object' || userData.promoCodesUsed === null) {
                userData.promoCodesUsed = {};
            }
        }
        updateUI();
    }

    function updateUI() {
        strawberryCountElem.textContent = `?? ${userData.strawberries}`;
        updateHomeSection();
        updateGameSection();
        updateProfileSection();
        updatePityDisplay();
    }

    function updateHomeSection() {
        animalsGrid.innerHTML = '';
        if (userData.animalsOwned.length === 0) {
            noAnimalsMessage.style.display = 'block';
        } else {
            noAnimalsMessage.style.display = 'none';
            // Ñîðòèðîâêà ïî ðåäêîñòè
            const sortedAnimals = [...userData.animalsOwned].sort((a, b) => {
                const rarityOrder = ['êðàñíîå', 'îðàíæåâîå', 'æåëòîå', 'çåëåíîå', 'ãîëóáîå', 'ñèíåå', 'ôèîëåòîâîå'];
                return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
            });

            sortedAnimals.forEach(animal => {
                const card = document.createElement('div');
                card.className = 'animal-card';
                card.innerHTML = `
                    <img src="${animal.image}" alt="${animal.name}">
                    <div class="name">${animal.name}</div>
                    <div class="rarity ${RARITIES[animal.rarity].color}">${RARITIES[animal.rarity].name}</div>
                `;
                animalsGrid.appendChild(card);
            });
        }
    }

    function updateGameSection() {
        clickerLevelElem.textContent = userData.clickerLevel;
        const strawberriesPerClick = userData.clickerLevel;
        strawberriesPerClickElem.textContent = strawberriesPerClick;

        const nextLevel = userData.clickerLevel + 1;
        if (nextLevel <= 10) {
            const cost = CLICKER_UPGRADE_COSTS[nextLevel - 1];
            upgradeCostInfo.textContent = `Ñëåäóþùèé óðîâåíü: ${nextLevel} (+${nextLevel} ?? çà êëèê), Ñòîèìîñòü: ${cost} ??`;
            upgradeClickerBtn.textContent = `Óëó÷øèòü (${cost} ??)`;
            upgradeClickerBtn.disabled = userData.strawberries < cost;
        } else {
            upgradeCostInfo.textContent = 'Êëóáíèêà ïðîêà÷àíà äî ìàêñèìàëüíîãî óðîâíÿ!';
            upgradeClickerBtn.textContent = 'Ìàêñ. óðîâåíü';
            upgradeClickerBtn.disabled = true;
        }
    }

    function updateProfileSection() {
        profileAvatar.src = Telegram.WebApp.initDataUnsafe?.user?.photo_url || userData.userAvatar;
        profileNickname.textContent = Telegram.WebApp.initDataUnsafe?.user?.first_name || userData.userName;

        const totalPulls = userData.stats.luckyPulls + userData.stats.pityPulls;
        const luckPercentage = totalPulls > 0 ? ((userData.stats.luckyPulls / totalPulls) * 100).toFixed(2) : 0;

        profileLuck.textContent = `${luckPercentage}%`;
        profileTotalPets.textContent = userData.animalsOwned.length;
        profileStrawberriesSpent.textContent = userData.stats.strawberriesSpent;
        profileTotalClicks.textContent = userData.stats.totalClicks;
    }

    function updatePityDisplay() {
        pityList.innerHTML = '';
        const rarityOrder = ['êðàñíîå', 'îðàíæåâîå', 'æåëòîå', 'çåëåíîå', 'ãîëóáîå', 'ñèíåå']; // Ôèîëåòîâîå áåç ïèòè

        rarityOrder.forEach(rarityKey => {
            const pityThreshold = RARITIES[rarityKey].pity;
            if (pityThreshold > 0) {
                const remaining = pityThreshold - userData.pityCounters[rarityKey];
                const listItem = document.createElement('li');
                listItem.textContent = `${RARITIES[rarityKey].name}: ${remaining <= 0 ? 'Ãàðàíò!' : `${remaining} êðóòîê`}`;
                if (remaining <= 0) {
                    listItem.style.backgroundColor = '#ffd700'; // Gold for guaranteed
                    listItem.style.color = '#333';
                }
                pityList.appendChild(listItem);
            }
        });
    }

    // --- Navigation ---
    function showSection(sectionId) {
        const sections = [homeSection, gachaSection, gameSection, profileSection];
        sections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(`nav-${sectionId.replace('-section', '')}`).classList.add('active');

        Telegram.WebApp.MainButton.hide(); // Hide main button by default for sections
    }

    navHomeBtn.addEventListener('click', () => showSection('home-section'));
    navGachaBtn.addEventListener('click', () => showSection('gacha-section'));
    navGameBtn.addEventListener('click', () => showSection('game-section'));
    navProfileBtn.addEventListener('click', () => showSection('profile-section'));

    // --- Game Logic: Clicker ---
    strawberryImage.addEventListener('click', () => {
        const strawberriesGained = userData.clickerLevel;
        userData.strawberries += strawberriesGained;
        userData.stats.totalClicks++;
        saveUserData();
        updateUI();

        // Click feedback animation
        const feedback = document.createElement('div');
        feedback.textContent = `+${strawberriesGained}`;
        feedback.className = 'click-feedback';
        const rect = strawberryImage.getBoundingClientRect();
        feedback.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 40}px`;
        feedback.style.top = `${rect.top + rect.height / 2 + (Math.random() - 0.5) * 40}px`;
        document.body.appendChild(feedback);
        feedback.addEventListener('animationend', () => feedback.remove());
    });

    upgradeClickerBtn.addEventListener('click', () => {
        const nextLevel = userData.clickerLevel + 1;
        if (nextLevel <= 10) {
            const cost = CLICKER_UPGRADE_COSTS[nextLevel - 1];
            if (userData.strawberries >= cost) {
                userData.strawberries -= cost;
                userData.clickerLevel = nextLevel;
                saveUserData();
                updateUI();
            } else {
                Telegram.WebApp.showAlert('Íåäîñòàòî÷íî êëóáíèêè äëÿ óëó÷øåíèÿ!');
            }
        }
    });

    // --- Game Logic: Gacha ---
    function getRandomRarity() {
        let chosenRarity = null;
        let isPityPull = false;

        // Check for pity, from rarest to common
        const rarityOrder = ['êðàñíîå', 'îðàíæåâîå', 'æåëòîå', 'çåëåíîå', 'ãîëóáîå', 'ñèíåå'];
        for (const rarityKey of rarityOrder) {
            const pityThreshold = RARITIES[rarityKey].pity;
            if (pityThreshold > 0 && userData.pityCounters[rarityKey] >= pityThreshold) {
                chosenRarity = rarityKey;
                isPityPull = true;
                userData.stats.pityPulls++;
                break;
            }
        }

        // If no pity, roll based on chances
        if (!chosenRarity) {
            let rand = Math.random();
            let cumulativeChance = 0;
            for (const rarityKey in RARITIES) {
                cumulativeChance += RARITIES[rarityKey].chance;
                if (rand < cumulativeChance) {
                    chosenRarity = rarityKey;
                    userData.stats.luckyPulls++;
                    break;
                }
            }
        }
        return { rarity: chosenRarity, isPityPull: isPityPull };
    }

    function getAnimalByRarity(rarity) {
        const availableAnimals = ANIMALS.filter(animal => animal.rarity === rarity);
        if (rarity === 'êðàñíîå') {
            const bannerAnimal = ANIMALS.find(animal => animal.id === BANNER_ANIMAL_ID);
            // Åñëè ãàðàíòèðîâàí áàííåðíûé èëè ýòî ïåðâàÿ ëåãà
            if (userData.redGuaranteedBanner) {
                userData.redGuaranteedBanner = false; // Ñëåäóþùàÿ êðàñíàÿ íå ãàðàíòèðóåò áàííåð
                return bannerAnimal;
            } else {
                // Âûïàëà êðàñíàÿ, íî íå áàííåð
                const otherRedAnimals = availableAnimals.filter(animal => animal.id !== BANNER_ANIMAL_ID);
                const chosen = otherRedAnimals[Math.floor(Math.random() * otherRedAnimals.length)];
                userData.redGuaranteedBanner = true; // Ñëåäóþùàÿ êðàñíàÿ áóäåò ãàðàíòèðîâàòü áàííåð
                return chosen;
            }
        } else {
            return availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
        }
    }

    function resetPity(rolledRarity) {
        for (const rarityKey in RARITIES) {
            // Reset only for the rarity rolled, and all higher rarities
            // E.g., if you pull a red, all pity counters reset (red, orange, yellow, etc.)
            // If you pull an orange, orange pity and higher rarities (yellow, green, ...) reset
            if (RARITIES[rarityKey].chance <= RARITIES[rolledRarity].chance) {
                userData.pityCounters[rarityKey] = 0;
            } else {
                userData.pityCounters[rarityKey]++; // Increment lower rarity pity counters
            }
        }
    }


    async function spinGacha(numSpins) {
        const totalCost = numSpins * GACHA_COST_PER_SPIN;
        if (userData.strawberries < totalCost) {
            Telegram.WebApp.showAlert('Íåäîñòàòî÷íî êëóáíèêè äëÿ êðóòêè!');
            return;
        }

        spin1Btn.disabled = true;
        spin10Btn.disabled = true;
        userData.strawberries -= totalCost;
        userData.stats.strawberriesSpent += totalCost;

        const results = [];
        for (let i = 0; i < numSpins; i++) {
            const { rarity: rolledRarity, isPityPull } = getRandomRarity();
            const chosenAnimal = getAnimalByRarity(rolledRarity);
            
            // Increment all pity counters before resetting for the current pull
            for (const rarityKey in RARITIES) {
                userData.pityCounters[rarityKey]++;
            }

            // Reset pity logic
            resetPity(rolledRarity);

            userData.animalsOwned.push(chosenAnimal);
            userData.stats.totalPets++;
            results.push(chosenAnimal);
        }

        // Animation only for the last pulled animal (or single pull)
        const finalAnimal = results[results.length - 1];
        await animateGachaSpin(finalAnimal);

        saveUserData();
        updateUI();
        spin1Btn.disabled = false;
        spin10Btn.disabled = false;

        // For 10 pulls, might show a summary of all animals pulled
        if (numSpins > 1) {
             Telegram.WebApp.showAlert(`Âû âûáèëè ${results.length} ïèòîìöåâ! Ïîñëåäíèé: ${finalAnimal.name} (${RARITIES[finalAnimal.rarity].name})`);
        }
    }

    // Function to get the target rotation for a rarity
    function getRotationForRarity(rarity) {
        const rarityAngles = {
            'ôèîëåòîâîå': 0,
            'ñèíåå': 51.4,
            'ãîëóáîå': 102.8,
            'çåëåíîå': 154.2,
            'æåëòîå': 205.6,
            'îðàíæåâîå': 257,
            'êðàñíîå': 308.4
        };
        // We want the indicator to point *at* the segment.
        // The segments are rotated, so we need to calculate an appropriate stopping point.
        // A full circle is 360 degrees. 7 segments means 360/7 = ~51.4 degrees per segment.
        // Let's add multiple full rotations to make it spin
        const baseRotation = rarityAngles[rarity];
        return 360 * 5 + baseRotation + (Math.random() * 40 - 20); // 5 full spins + target + slight random jitter
    }

    async function animateGachaSpin(animal) {
        // Hide previous result
        gachaAnimalImage.style.display = 'none';
        gachaAnimalName.style.display = 'none';
        gachaAnimalRarity.style.display = 'none';
        
        gachaSpinner.style.transition = 'none'; // Reset transition instantly
        gachaSpinner.style.transform = 'rotate(0deg)'; // Start from 0

        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to apply reset

        const targetRotation = getRotationForRarity(animal.rarity);
        gachaSpinner.style.transition = 'transform 5s cubic-bezier(0.1, 0.7, 0.9, 1)';
        gachaSpinner.style.transform = `rotate(-${targetRotation}deg)`; // Spin counter-clockwise

        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for animation to complete

        // Display result
        gachaAnimalImage.src = animal.image;
        gachaAnimalImage.style.display = 'block';
        gachaAnimalName.textContent = animal.name;
        gachaAnimalName.style.display = 'block';
        gachaAnimalRarity.textContent = RARITIES[animal.rarity].name;
        gachaAnimalRarity.className = `rarity ${RARITIES[animal.rarity].color}`;
        gachaAnimalRarity.style.display = 'block';
    }


    spin1Btn.addEventListener('click', () => spinGacha(1));
    spin10Btn.addEventListener('click', () => spinGacha(10));

    // --- Promo Code Logic ---
    activatePromoBtn.addEventListener('click', () => {
        const code = promoCodeInput.value.trim().toUpperCase();
        if (!code) {
            promoMessage.textContent = 'Ââåäèòå ïðîìîêîä.';
            promoMessage.style.color = 'orange';
            return;
        }

        if (userData.promoCodesUsed[code]) {
            promoMessage.textContent = 'Ýòîò ïðîìîêîä óæå áûë èñïîëüçîâàí.';
            promoMessage.style.color = 'red';
            return;
        }

        const promo = PROMO_CODES[code];
        if (promo) {
            if (promo.strawberries) {
                userData.strawberries += promo.strawberries;
            }
            if (promo.spins) {
                // For simplicity, 1 free spin means 100 strawberries to spend.
                // Or you could make a separate gacha logic for free spins.
                // Let's just add equivalent strawberries for this demo.
                userData.strawberries += promo.spins * GACHA_COST_PER_SPIN;
            }
            userData.promoCodesUsed[code] = true;
            promoMessage.textContent = promo.message;
            promoMessage.style.color = 'green';
            saveUserData();
            updateUI();
        } else {
            promoMessage.textContent = 'Íåâåðíûé ïðîìîêîä.';
            promoMessage.style.color = 'red';
        }
        promoCodeInput.value = '';
    });


    // --- Initialization ---
    loadUserData();
    showSection('home-section'); // Start on the home section
});

