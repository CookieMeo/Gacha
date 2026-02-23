import logging, asyncio, os, sqlite3, sys
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo
from aiohttp import web

# Пытаемся импортировать базу
try:
    from db import init_db, get_user, create_user, DB_NAME, do_spins_logic
except ImportError as e:
    print(f"ОШИБКА ИМПОРТА DB: {e}")
    sys.exit(1)

TOKEN = "8120653173:AAE6CIrlC_BLOJn8OLRESiiawaZ8QtApvA4"
bot = Bot(token=TOKEN)
dp = Dispatcher()

UPGRADE_COSTS = {
    1: [0, 1], 2: [10, 2], 3: [40, 3], 4: [90, 4], 5: [160, 5], 
    6: [250, 6], 7: [360, 7], 8: [490, 8], 9: [640, 9], 10: [810, 10], 11: [4000, 100]
}

# --- API ---
async def api_get_user(request):
    try:
        data = await request.json()
        uid = data.get('user_id')
        u = get_user(uid) or (create_user(uid, "Player") or get_user(uid))
        return web.json_response(u)
    except: return web.json_response({"error": "fail"}, status=500)

async def api_click(request):
    try:
        uid = (await request.json()).get('user_id')
        u = get_user(uid)
        if not u: return web.json_response({"success": False})
        pwr = UPGRADE_COSTS.get(u['click_level'], [0, 1])[1]
        conn = sqlite3.connect(DB_NAME)
        conn.execute("UPDATE users SET strawberry=strawberry+?, total_clicks=total_clicks+1 WHERE user_id=?", (pwr, uid))
        conn.commit()
        conn.close()
        return web.json_response({"success": True})
    except: return web.json_response({"success": False}, status=500)

async def api_get_inventory(request):
    try:
        uid = (await request.json()).get('user_id')
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        items = conn.execute("SELECT * FROM user_inventory WHERE user_id = ? ORDER BY id DESC", (uid,)).fetchall()
        conn.close()
        return web.json_response([dict(ix) for ix in items])
    except: return web.json_response([])

async def api_spin(request):
    try:
        data = await request.json()
        return web.json_response(do_spins_logic(data.get('user_id'), data.get('count', 1)))
    except: return web.json_response({"success": False}, status=500)

async def api_buy(request):
    try:
        data = await request.json()
        uid, count = data.get('user_id'), data.get('count')
        cost = {1:100, 5:500, 10:1000, 40:4000, 100:10000}.get(count, 999999)
        u = get_user(uid)
        if u and u['strawberry'] >= cost:
            conn = sqlite3.connect(DB_NAME)
            conn.execute("UPDATE users SET strawberry=strawberry-?, spins=spins+? WHERE user_id=?", (cost, count, uid))
            conn.commit()
            conn.close()
            return web.json_response({"success": True})
        return web.json_response({"success": False})
    except: return web.json_response({"success": False}, status=500)

# --- ЗАПУСК ---
@dp.message(Command("start"))
async def cmd_start(m: types.Message):
    create_user(m.from_user.id, m.from_user.username)
    kb = types.ReplyKeyboardMarkup(keyboard=[[types.KeyboardButton(text="🚀 Играть", web_app=WebAppInfo(url="https://gacha-iifj.onrender.com"))]], resize_keyboard=True)
    await m.answer("Добро пожаловать!", reply_markup=kb)

async def main():
    try:
        init_db()
        logging.basicConfig(level=logging.INFO)
        app = web.Application()
        # Проверяем наличие папки webapp
        if not os.path.exists('./webapp'):
            print("ОШИБКА: Папка './webapp' не найдена!")
        
        app.router.add_get('/', lambda r: web.FileResponse('./webapp/index.html'))
        app.router.add_post('/api/get_user', api_get_user)
        app.router.add_post('/api/click', api_click)
        app.router.add_post('/api/spin', api_spin)
        app.router.add_post('/api/get_inventory', api_get_inventory)
        app.router.add_post('/api/buy', api_buy)
        app.router.add_static('/', path='./webapp', show_index=False)
        
        runner = web.AppRunner(app)
        await runner.setup()
        port = int(os.environ.get("PORT", 10000))
        site = web.TCPSite(runner, '0.0.0.0', port)
        await site.start()
        print(f"--- SERVER STARTED ON PORT {port} ---")
        await dp.start_polling(bot)
    except Exception as e:
        print(f"КРИТИЧЕСКАЯ ОШИБКА ПРИ ЗАПУСКЕ: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
