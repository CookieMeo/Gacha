body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f0f2f5;
    color: #333;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: flex-start; /* Align to top for Telegram webview */
    min-height: 100vh;
    box-sizing: border-box;
    overflow-x: hidden;
}

#app-container {
    width: 100%;
    max-width: 420px; /* Typical mobile width */
    background-color: #fff;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100vh; /* Full height for the mini app */
}

#header {
    background-color: #6a5acd;
    color: white;
    padding: 15px;
    text-align: right;
    font-size: 1.2em;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.app-section {
    flex-grow: 1;
    padding: 20px;
    display: none;
    overflow-y: auto; /* Enable scrolling for content */
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.app-section.active {
    display: block;
}

h2 {
    color: #4a4a4a;
    margin-top: 0;
    text-align: center;
    margin-bottom: 20px;
}

/* Navbar */
#navbar {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
    background-color: #f8f8f8;
    border-top: 1px solid #eee;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
}

#navbar button {
    background: none;
    border: none;
    color: #6a5acd;
    font-size: 1em;
    padding: 10px 15px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.9em;
}

#navbar button:hover {
    background-color: #e6e6fa;
    border-radius: 8px;
}
#navbar button.active {
    color: #8a2be2;
    font-weight: bold;
}


/* General Buttons */
button {
    background-color: #6a5acd;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.2s ease;
    margin: 5px;
}

button:hover {
    background-color: #5544ad;
}

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* Home Section */
#animals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 15px;
    padding: 10px;
}

.animal-card {
    background-color: #f9f9f9;
    border-radius: 10px;
    padding: 10px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: transform 0.1s ease;
    overflow: hidden;
    position: relative;
}
.animal-card img {
    max-width: 80px;
    height: auto;
    border-radius: 8px;
    margin-bottom: 5px;
}
.animal-card .name {
    font-weight: bold;
    font-size: 0.9em;
    margin-bottom: 3px;
    color: #444;
}
.animal-card .rarity {
    font-size: 0.8em;
    padding: 3px 6px;
    border-radius: 5px;
    display: inline-block;
}

/* Rarity Colors */
.rarity.фиолетовое { background-color: #e0b0ff; color: #4b0082; }
.rarity.синее { background-color: #add8e6; color: #00008b; }
.rarity.голубое { background-color: #87ceeb; color: #0000cd; }
.rarity.зеленое { background-color: #90ee90; color: #006400; }
.rarity.желтое { background-color: #ffffe0; color: #b8860b; }
.rarity.оранжевое { background-color: #ffa07a; color: #ff4500; }
.rarity.красное { background-color: #ff7f50; color: #dc143c; }


#no-animals-message {
    text-align: center;
    color: #888;
    margin-top: 20px;
}

/* Gacha Section */
#gacha-spinner-container {
    width: 250px;
    height: 250px;
    margin: 20px auto;
    position: relative;
    border-radius: 50%;
    background-color: #eee; /* Fallback */
    overflow: hidden;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.2), 0 0 15px rgba(0,0,0,0.1);
}

#gacha-spinner {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    transition: transform 5s cubic-bezier(0.1, 0.7, 0.9, 1); /* Slower, more bouncy spin */
}

.segment {
    position: absolute;
    width: 50%;
    height: 50%;
    transform-origin: 100% 100%;
    border: 1px solid #ccc; /* Separator */
    box-sizing: border-box;
}
.segment.violet { background-color: #9400D3; transform: rotate(0deg) skewY(-30deg); top: 50%; left: 0%; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);}
.segment.blue { background-color: #0000FF; transform: rotate(51.4deg) skewY(-30deg); top: 50%; left: 0%; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
.segment.cyan { background-color: #00FFFF; transform: rotate(102.8deg) skewY(-30deg); top: 50%; left: 0%; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
.segment.green { background-color: #008000; transform: rotate(154.2deg) skewY(-30deg); top: 50%; left: 0%; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
.segment.yellow { background-color: #FFFF00; transform: rotate(205.6deg) skewY(-30deg); top: 50%; left: 0%; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
.segment.orange { background-color: #FFA500; transform: rotate(257deg) skewY(-30deg); top: 50%; left: 0%; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
.segment.red { background-color: #FF0000; transform: rotate(308.4deg) skewY(-30deg); top: 50%; left: 0%; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }

/*
Note on segment styling: The above is a simplified way to create segments, but making a perfect pie chart with CSS can be tricky and might involve more complex clip-path or multiple elements. For a visual effect, these might suffice or need further refinement. A more robust way might be to use conical gradients or SVG. For a simple demonstration, this radial setup is good enough.
*/

#spinner-indicator {
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 25px solid #333; /* Dark triangle pointing down */
    position: absolute;
    top: -5px; /* Position above the spinner */
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
}

#gacha-result {
    text-align: center;
    margin-top: 20px;
    min-height: 180px; /* To prevent layout shift */
}
#gacha-animal-image {
    max-width: 150px;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.5s ease-out;
}
#gacha-animal-name {
    font-size: 1.5em;
    font-weight: bold;
    margin-top: 10px;
}
#gacha-animal-rarity {
    font-size: 1em;
    margin-top: 5px;
}

.gacha-buttons {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

#pity-info {
    margin-top: 15px;
    padding: 10px;
    background-color: #f0f8ff;
    border-radius: 8px;
    text-align: center;
}
#pity-info p {
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
}
#pity-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
}
#pity-list li {
    background-color: #e6e6fa;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.85em;
    color: #4b0082;
}


/* Game Section (Clicker) */
.clicker-container {
    text-align: center;
    position: relative;
    margin: 20px 0;
}
#strawberry-image {
    width: 150px;
    height: 150px;
    cursor: pointer;
    transition: transform 0.1s ease-out;
}
#strawberry-image:active {
    transform: scale(0.95);
}
#click-feedback {
    position: absolute;
    color: green;
    font-weight: bold;
    font-size: 1.5em;
    opacity: 0;
    pointer-events: none;
    animation: floatUpFadeOut 1s forwards;
    z-index: 100;
}

@keyframes floatUpFadeOut {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
}

#upgrade-clicker-btn {
    display: block;
    margin: 20px auto 10px;
}
#upgrade-cost-info {
    text-align: center;
    font-size: 0.9em;
    color: #777;
}

/* Profile Section */
.profile-info {
    text-align: center;
    margin-bottom: 30px;
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.profile-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 15px;
    border: 3px solid #6a5acd;
}
.profile-info p {
    font-size: 1.1em;
    margin: 8px 0;
    color: #555;
}
.profile-info span {
    font-weight: bold;
    color: #333;
}

.promo-code-section {
    text-align: center;
    margin-top: 20px;
    padding: 15px;
    background-color: #e6e6fa;
    border-radius: 10px;
}
.promo-code-section h3 {
    margin-top: 0;
    color: #4b0082;
}
#promo-code-input {
    width: calc(100% - 20px);
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1em;
}
#activate-promo-btn {
    width: 100%;
    background-color: #8a2be2;
}
#activate-promo-btn:hover {
    background-color: #7b27cc;
}
#promo-message {
    margin-top: 10px;
    font-weight: bold;
    color: #333;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* For Telegram Web App smooth experience */
@media (prefers-color-scheme: dark) {
    body {
        background-color: #222;
        color: #eee;
    }
    #app-container {
        background-color: #333;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    }
    #header {
        background-color: #4b3e8a;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }
    h2, .profile-info span {
        color: #eee;
    }
    #navbar {
        background-color: #2d2d2d;
        border-top: 1px solid #444;
        box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
    }
    #navbar button {
        color: #a093ed;
    }
    #navbar button:hover {
        background-color: #3a3a3a;
    }
    #navbar button.active {
        color: #c9a0ff;
    }
    .animal-card {
        background-color: #444;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    .animal-card .name {
        color: #ddd;
    }
    .animal-card .rarity {
        color: #fff;
    }
    #no-animals-message {
        color: #bbb;
    }
    #gacha-spinner-container {
        background-color: #444;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.4), 0 0 15px rgba(0,0,0,0.2);
    }
    #spinner-indicator {
        border-top-color: #eee;
    }
    #gacha-animal-image {
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }
    button {
        background-color: #7a6adb;
    }
    button:hover {
        background-color: #6a5bcb;
    }
    button:disabled {
        background-color: #555;
    }
    #pity-info {
        background-color: #3a3a5a;
        color: #eee;
    }
    #pity-info p {
        color: #ccc;
    }
    #pity-list li {
        background-color: #5a5a7a;
        color: #e0b0ff;
    }
    .profile-info {
        background-color: #444;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .profile-info p {
        color: #ccc;
    }
    #profile-avatar {
        border-color: #7a6adb;
    }
    .promo-code-section {
        background-color: #3a3a5a;
    }
    .promo-code-section h3 {
        color: #c9a0ff;
    }
    #promo-code-input {
        background-color: #555;
        color: #eee;
        border-color: #777;
    }
    #activate-promo-btn {
        background-color: #9370db;
    }
    #activate-promo-btn:hover {
        background-color: #8360cb;
    }
    #promo-message {
        color: #eee;
    }

    /* Rarity Colors for dark mode - adjust if needed for better contrast */
    .rarity.фиолетовое { background-color: #6a0dad; color: #fff; }
    .rarity.синее { background-color: #0000bd; color: #fff; }
    .rarity.голубое { background-color: #007acd; color: #fff; }
    .rarity.зеленое { background-color: #007000; color: #fff; }
    .rarity.желтое { background-color: #a0a000; color: #fff; }
    .rarity.оранжевое { background-color: #a54500; color: #fff; }
    .rarity.красное { background-color: #a00000; color: #fff; }
}
