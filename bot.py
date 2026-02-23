import logging, asyncio, os, sys, sqlite3
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo
from aiohttp import web
from db import init_db, get_user, create_user, do_spins_logic, update_stats, PETS_DATA # Импорт новых функций
import json # нужен для работы с json

# --- КОНФИГУРАЦИЯ ---
TOKEN = "8120653173:AAE6CIrlC_BLOJn8OLRESiiawaZ8QtApvA4" # !!! ЗАМЕНИ НА СВОЙ ТОКЕН !!!
ADMIN_USER_ID = 1562471251 # !!! ЗАМЕНИ НА СВОЙ ID !!!
WEB_APP_URL = "https://gacha2-5ng0.onrender.com" # !!! ПРОВЕРЬ СВОЙ АДРЕС !!!

bot = Bot(token=TOKEN)
dp = Dispatcher()

# --- ИНИЦИАЛИЗАЦИЯ БАЗЫ ---
init_db()

# --- КОНСТАНТЫ ---
UPGRADE_COSTS = {
    2: [10, 2], 3: [40, 3], 4: [90, 4], 5: [160, 5], 6: [250, 6], 
    7: [360, 7], 8: [490, 8], 9: [640, 9], 10: [810, 10], 11: [4000, 100]
}

# --- API ЭНДПОИНТЫ ---
async def api_get_user(request):
    try:
        uid = (await request.json()).get('user_id')
        u = get_user(uid)
        if not u: 
            create_user(uid, "Игрок") # Создаем, если нет
            u = get_user(uid)
        return web.json_response(u)
    except Exception as e: return web.json_response({"success": False, "error": str(e)}, status=500)

async def api_click(request):
    try:
        uid = (await request.json()).get('user_id')
        u = get_user(uid)
        power = 1 
        if u['click_level'] in UPGRADE_COSTS:
            power = UPGRADE_COSTS[u['click_level']][1]
        elif u['click_level'] >= 11:
            power = 100
            
        conn = sqlite3.connect(DB_NAME)
        conn.execute("UPDATE users SET strawberry = strawberry + ?, total_clicks = total_clicks + 1 WHERE user_id = ?", (power, uid))
        conn.commit()
        conn.close()
        return web.json_response({"success": True})
    except Exception as e: return web.json_response({"success": False, "error": str(e)}, status=500)

async def api_buy(request):
    try:
        data = await request.json()
        uid, count = data.get('user_id'), data.get('count')
        cost = BUY_SPINS_COST.get(count)
        if not cost: return web.json_response({"success": False, "error": "Неверное количество"}, status=400)
        
        u = get_user(uid)
        if u and u['strawberry'] >= cost:
            conn = sqlite3.connect(DB_NAME)
            conn.execute("UPDATE users SET strawberry=strawberry-?, spins=spins+?, total_spent = total_spent + ?, total_spins_bought = total_spins_bought + ? WHERE user_id=?", (cost, count, cost, count, uid))
            conn.commit()
            return web.json_response({"success": True})
        return web.json_response({"success": False, "error": "Недостаточно клубники!"})
    except Exception as e: return web.json_response({"success": False, "error": str(e)}, status=500)

async def api_upgrade(request):
    try:
        uid = (await request.json()).get('user_id')
        u = get_user(uid)
        nxt = u['click_level'] + 1
        if nxt in UPGRADE_COSTS and u['strawberry'] >= UPGRADE_COSTS[nxt][0]:
            conn = sqlite3.connect(DB_NAME)
            conn.execute("UPDATE users SET strawberry=strawberry-?, click_level=? WHERE user_id=?", (UPGRADE_COSTS[nxt][0], nxt, uid))
            conn.commit()
            return web.json_response({"success": True})
        return web.json_response({"success": False, "error": "Недостаточно клубники или макс. уровень."})
    except Exception as e: return web.json_response({"success": False, "error": str(e)}, status=500)

async def api_spin(request):
    try:
        data = await request.json()
        uid = data.get('user_id')
        count = int(data.get('count', 1))
        result = do_spins_logic(uid, count)
        return web.json_response(result)
    except Exception as e: return web.json_response({"success": False, "error": str(e)}, status=500)

async def api_get_inventory(request):
    try:
        data = await request.json()
        uid = data.get('user_id')
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        items = conn.execute("SELECT * FROM user_inventory WHERE user_id = ? ORDER BY id DESC", (uid,)).fetchall()
        conn.close()
        return web.json_response([dict(ix) for ix in items])
    except Exception as e: return web.json_response({"success": False, "error": str(e)}, status=500)

# --- API ЭНДПОИНТ ДЛЯ ВСЕХ ПЕРСОНАЖЕЙ ---
async def api_get_all_pets(request):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    pets = cursor.execute("SELECT name, rarity, image_url, skill FROM pets").fetchall()
    conn.close()
    return web.json_response(pets)

# --- ЗАПУСК СЕРВЕРА И БОТА ---
async def index(request):
    return web.FileResponse('./webapp/index.html')

async def main():
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    app = web.Application()
    app.router.add_post('/api/get_user', api_get_user)
    app.router.add_post('/api/click', api_click)
    app.router.add_post('/api/buy', api_buy)
    app.router.add_post('/api/upgrade', api_upgrade)
    app.router.add_post('/api/spin', api_spin)
    app.router.add_post('/api/get_inventory', api_get_inventory)
    app.router.add_post('/api/get_all_pets', api_get_all_pets) # Добавляем API для всех питомцев

    app.router.add_get('/', index)
    app.router.add_static('/', path='./webapp', show_index=False)
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', int(os.environ.get("PORT", 10000)))
    
    await asyncio.gather(site.start(), dp.start_polling(bot))

# --- ОБРАБОТЧИКИ БОТА ---
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    create_user(message.from_user.id, message.from_user.username)
    kb = types.ReplyKeyboardMarkup(
        keyboard=[
            [types.KeyboardButton(text="🚀 Запустить игру", web_app=WebAppInfo(url=WEB_APP_URL))]
        ],
        resize_keyboard=True,
        one_time_keyboard=False
    )
    await message.answer("Привет! Нажми кнопку ниже, чтобы начать играть.", reply_markup=kb)

@dp.message(Command("reset_db"))
async def reset_database(message: types.Message):
    if message.from_user.id != ADMIN_USER_ID: return await message.answer("Ты не админ!")
    try:
        init_db() # Просто пересоздаем базу
        await message.answer("✅ База данных сброшена и заполнена!")
    except Exception as e: await message.answer(f"❌ Ошибка: {e}")

@dp.message(Command("add_pet")) # Команда для добавления питомцев через бота (если нужно)
async def add_pet_cmd(m: types.Message):
    if m.from_user.id != ADMIN_USER_ID: return
    try:
        # Формат: /add_pet Имя, Редкость, url_картинки, ивент(0/1), Навык
        data = m.text.split(maxsplit=1)[1].split(', ')
        name, rarity, img_url, is_event, skill = data[0], data[1], data[2], int(data[3]), data[4]
        
        conn = sqlite3.connect(DB_NAME)
        conn.execute("INSERT INTO pets (name, rarity, image_url, is_event, skill) VALUES (?,?,?,?,?)", (name, rarity, img_url, is_event, skill))
        conn.commit()
        conn.close()
        await m.answer(f"✅ Добавлен питомец: {name}")
    except Exception as e: await m.answer(f"Ошибка. Формат: /add_pet Имя, Редкость, url, ивент(0/1), Навык. Ошибка: {e}")

if __name__ == "__main__":
    asyncio.run(main())
