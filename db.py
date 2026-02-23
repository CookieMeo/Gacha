import sqlite3
import random
import os

DB_NAME = 'gacha_game.db'

# --- ПЕРСОНАЖИ ---
# (Имя, Редкость, Картинка, Ивент(0/1), Навык - пока не используется)
PETS_DATA = [
    ("Собака", "Фиолетовое", "assets/pets/dog.png", 0, ""),
    ("Кошка", "Фиолетовое", "assets/pets/cat.png", 0, ""),
    ("Божья коровка", "Фиолетовое", "assets/pets/ladybag.png", 0, ""),
    
    ("Мышь", "Синее", "assets/pets/mouse.png", 0, ""),
    ("Хомяк", "Синее", "assets/pets/hamster.png", 0, ""),
    
    ("Кролик", "Голубое", "assets/pets/bunny.png", 0, ""),
    ("Улитка", "Голубое", "assets/pets/snail.png", 0, ""),
    ("Пчела", "Голубое", "assets/pets/bee.png", 0, ""),
    
    ("Черепаха", "Зеленое", "assets/pets/turtle.png", 0, ""),
    ("Слон", "Зеленое", "assets/pets/elephant.png", 0, ""),
    ("Медведь", "Зеленое", "assets/pets/bear.png", 0, ""),
    
    ("Змея", "Желтое", "assets/pets/snake.png", 0, ""),
    ("Попугай", "Желтое", "assets/pets/parrot.png", 0, ""),
    ("Жираф", "Желтое", "assets/pets/giraffe.png", 0, ""),
    
    ("Летучая мышь", "Оранжевое", "assets/pets/bat.png", 0, ""),
    ("Акула", "Оранжевое", "assets/pets/shark.png", 0, ""),
    
    ("Единорог", "Красное", "assets/pets/unicorn.png", 0, ""),
    ("Дракон", "Красное", "assets/pets/dragon.png", 0, ""),
    ("Паук", "Красное", "assets/pets/spider.png", 0, ""),
    ("Феникс", "Красное", "assets/pets/phoenix.png", 1, ""),
    ("Цербер", "Красное", "assets/pets/cerberus.png", 1, "")
]

# --- ЦЕНЫ НА КРУТКИ ---
BUY_SPINS_COST = {
    1: 100, 5: 500, 10: 1000, 40: 4000, 100: 10000
}

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY, username TEXT, strawberry INTEGER DEFAULT 0, spins INTEGER DEFAULT 0,
        click_level INTEGER DEFAULT 1, 
        pity_red INTEGER DEFAULT 50, pity_orange INTEGER DEFAULT 30, pity_yellow INTEGER DEFAULT 15,
        pity_green INTEGER DEFAULT 10, pity_lightblue INTEGER DEFAULT 5, pity_blue INTEGER DEFAULT 3,
        guaranteed_event INTEGER DEFAULT 0,
        total_clicks INTEGER DEFAULT 0, total_spent INTEGER DEFAULT 0, total_spins_bought INTEGER DEFAULT 0,
        total_gacha_pulls INTEGER DEFAULT 0, total_pets_obtained INTEGER DEFAULT 0)''') # Добавил статистику
    
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
    count = cursor.execute("SELECT COUNT(*) FROM pets").fetchone()[0]
    if count == 0:
        cursor.executemany("INSERT INTO pets (name, rarity, image_url, is_event, skill) VALUES (?,?,?,?,?)", PETS_DATA)
        print("База персонажей заполнена!")

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

def update_stats(user_id, clicks=0, spent=0, spins_bought=0, gacha_pulls=0, pets_obtained=0):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users 
        SET total_clicks = total_clicks + ?, 
            total_spent = total_spent + ?, 
            total_spins_bought = total_spins_bought + ?,
            total_gacha_pulls = total_gacha_pulls + ?,
            total_pets_obtained = total_pets_obtained + ?
        WHERE user_id = ?
    """, (clicks, spent, spins_bought, gacha_pulls, pets_obtained, user_id))
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
    guar = u['guaranteed_event']
    
    # История выпадений (для счетчика)
    pull_history = {} 
    
    for i in range(count):
        total_spins_left = u['spins'] - (i + 1) # Сколько круток осталось после этой
        
        res_rarity = "Фиолетовое" # По умолчанию
        
        # Определяем редкость по гаранту
        if p['red'] <= 0: res_rarity = "Красное"
        elif p['orange'] <= 0: res_rarity = "Оранжевое"
        elif p['yellow'] <= 0: res_rarity = "Жёлтое"
        elif p['green'] <= 0: res_rarity = "Зеленое"
        elif p['lightblue'] <= 0: res_rarity = "Голубое"
        elif p['blue'] <= 0: res_rarity = "Синее"
        
        # Сбрасываем гаранты
        resets_map = {"Красное":'red',"Оранжевое":'orange',"Жёлтое":'yellow',"Зеленое":'green',"Голубое":'lightblue',"Синее":'blue'}
        resets_vals = {"Красное":50,"Оранжевое":30,"Жёлтое":15,"Зеленое":10,"Голубое":5,"Синее":3}
        if res_rarity in resets_map: p[resets_map[res_rarity]] = resets_vals[res_rarity]

        # 50/50 для красной редкости
        is_event_pull = 0
        if res_rarity == "Красное":
            if guar == 1 or random.random() < 0.5:
                is_event_pull = 1
                guar = 0 # Сброс гаранта
            else:
                guar = 1 # Гарант активирован

        # Ищем питомца
        pet = cursor.execute("SELECT name, rarity, image_url, skill FROM pets WHERE rarity=? AND is_event=? ORDER BY RANDOM() LIMIT 1", (res_rarity, is_event_pull)).fetchone()
        if not pet: # Если ивентового нет, берем обычного
            pet = cursor.execute("SELECT name, rarity, image_url, skill FROM pets WHERE rarity=? ORDER BY RANDOM() LIMIT 1", (res_rarity,)).fetchone()
        
        # Если вообще ничего не нашли (маловероятно, но для безопасности)
        if not pet: pet = ("Пустота", res_rarity, "assets/strawberry.png", "")

        # Добавляем в инвентарь
        cursor.execute("INSERT INTO user_inventory (user_id, pet_name, pet_rarity, pet_image, pet_skill) VALUES (?, ?, ?, ?, ?)",
                       (user_id, pet[0], pet[1], pet[2], pet[3]))
        
        # Добавляем в результаты
        results.append({"name": pet[0], "rarity": pet[1], "image_url": pet[2], "skill": pet[3]})

    # Обновляем пользователя
    cursor.execute('''UPDATE users SET spins=?, pity_red=?, pity_orange=?, pity_yellow=?, 
                      pity_green=?, pity_lightblue=?, pity_blue=?, guaranteed_event=? WHERE user_id=?''',
                   (total_spins_left, p['red'], p['orange'], p['yellow'], p['green'], p['lightblue'], p['blue'], guar, user_id))
    conn.commit()
    conn.close()
    
    # Увеличиваем статистику
    update_stats(user_id, gacha_pulls=count, pets_obtained=count) # Учитываем, что выпало count питомцев
    return {"success": True, "pets": results}
