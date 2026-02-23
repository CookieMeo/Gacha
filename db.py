import sqlite3
import random

# ОБЯЗАТЕЛЬНО: одно имя файла для всех
DB_NAME = 'gacha_v3.db' 

PETS_DATA = [
    ("Огненный Дракон", "Красное", "assets/dragon.png", 1, "Огненное дыхание: +10% к клику"),
    ("Ледяной Кот", "Синее", "assets/ice_cat.png", 0, "Заморозка: +1 крутка в час"),
    ("Золотой Хомяк", "Жёлтое", "assets/hamster.png", 0, "+5 за клик"),
    ("Зеленый Ежик", "Зеленое", "assets/hedgehog.png", 0, "Колючки"),
    ("Голубой Птиц", "Голубое", "assets/bird.png", 0, "Песня"),
    ("Фиолетовый Кристалл", "Фиолетовое", "assets/crystal.png", 0, "Свечение"),
]

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Таблица пользователей со ВСЕЙ статистикой
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY, username TEXT, strawberry INTEGER DEFAULT 0, spins INTEGER DEFAULT 0,
        click_level INTEGER DEFAULT 1, 
        pity_red INTEGER DEFAULT 50, pity_orange INTEGER DEFAULT 30, pity_yellow INTEGER DEFAULT 15,
        pity_green INTEGER DEFAULT 10, pity_lightblue INTEGER DEFAULT 5, pity_blue INTEGER DEFAULT 3,
        guaranteed_event INTEGER DEFAULT 0,
        total_clicks INTEGER DEFAULT 0, total_spent INTEGER DEFAULT 0, total_spins_bought INTEGER DEFAULT 0,
        total_gacha_pulls INTEGER DEFAULT 0, total_pets_obtained INTEGER DEFAULT 0)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, rarity TEXT, image_url TEXT, 
        is_event INTEGER DEFAULT 0, skill TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS user_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, pet_name TEXT, 
        pet_rarity TEXT, pet_image TEXT, pet_skill TEXT)''')
    
    conn.commit()
    seed_pets(cursor)
    conn.close()

def seed_pets(cursor):
    if cursor.execute("SELECT COUNT(*) FROM pets").fetchone()[0] == 0:
        cursor.executemany("INSERT INTO pets (name, rarity, image_url, is_event, skill) VALUES (?,?,?,?,?)", PETS_DATA)

def get_user(user_id):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    user = conn.execute('SELECT * FROM users WHERE user_id = ?', (user_id,)).fetchone()
    conn.close()
    return dict(user) if user else None

def create_user(user_id, username):
    conn = sqlite3.connect(DB_NAME)
    conn.execute('INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)', (user_id, username))
    conn.commit()
    conn.close()
def do_spins_logic(user_id, count=1):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    u = get_user(user_id)
    if not u or u['spins'] < count: return {"success": False, "error": "Нет круток!"}

    results = []
    p = {'red': u['pity_red'], 'orange': u['pity_orange'], 'yellow': u['pity_yellow'], 
         'green': u['pity_green'], 'lightblue': u['pity_lightblue'], 'blue': u['pity_blue']}
    
    for _ in range(count):
        res_rarity = "Фиолетовое"
        if p['red'] <= 1: res_rarity, p['red'] = "Красное", 50
        elif p['orange'] <= 1: res_rarity, p['orange'] = "Оранжевое", 30
        elif p['yellow'] <= 1: res_rarity, p['yellow'] = "Жёлтое", 15
        elif p['green'] <= 1: res_rarity, p['green'] = "Зеленое", 10
        elif p['lightblue'] <= 1: res_rarity, p['lightblue'] = "Голубое", 5
        elif p['blue'] <= 1: res_rarity, p['blue'] = "Синее", 3
        else:
            for k in p: p[k] -= 1
        
        pet = cursor.execute("SELECT name, rarity, image_url, skill FROM pets WHERE rarity=? ORDER BY RANDOM() LIMIT 1", (res_rarity,)).fetchone()
        if pet:
            cursor.execute("INSERT INTO user_inventory (user_id, pet_name, pet_rarity, pet_image, pet_skill) VALUES (?, ?, ?, ?, ?)",
                           (user_id, pet[0], pet[1], pet[2], pet[3]))
            results.append({"name": pet[0], "rarity": pet[1], "image_url": pet[2]})

    cursor.execute('''UPDATE users SET spins=spins-?, pity_red=?, pity_orange=?, pity_yellow=?, 
                      pity_green=?, pity_lightblue=?, pity_blue=?, 
                      total_gacha_pulls=total_gacha_pulls+?, total_pets_obtained=total_pets_obtained+? WHERE user_id=?''',
                   (count, p['red'], p['orange'], p['yellow'], p['green'], p['lightblue'], p['blue'], count, count, user_id))
    conn.commit()
    conn.close()
    return {"success": True, "pets": results}
