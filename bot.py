import logging, asyncio, os, sqlite3, sys
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiohttp import web
from db import init_db, get_user, create_user, do_spins_logic, DB_NAME # ИМПОРТ ИМЕНИ БАЗЫ

TOKEN = "ТВОЙ_ТОКЕН"
bot = Bot(token=TOKEN)
dp = Dispatcher()

UPGRADE_COSTS = {
    2: [10, 2], 3: [40, 3], 4: [90, 4], 5: [160, 5], 6: [250, 6], 
    7: [360, 7], 8: [490, 8], 9: [640, 9], 10: [810, 10], 11: [4000, 100]
}

# --- API ---
async def api_get_user(request):
    data = await request.json()
    return web.json_response(get_user(data.get('user_id')))

async def api_click(request):
    uid = (await request.json()).get('user_id')
    u = get_user(uid)
    power = UPGRADE_COSTS.get(u['click_level'], [0, 1])[1]
    conn = sqlite3.connect(DB_NAME)
    # Исправлен запрос: теперь total_clicks точно есть
    conn.execute("UPDATE users SET strawberry=strawberry+?, total_clicks=total_clicks+1 WHERE user_id=?", (power, uid))
    conn.commit()
    conn.close()
    return web.json_response({"success": True})

async def api_get_inventory(request):
    uid = (await request.json()).get('user_id')
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    items = conn.execute("SELECT * FROM user_inventory WHERE user_id = ?", (uid,)).fetchall()
    conn.close()
    return web.json_response([dict(ix) for ix in items])

async def api_buy(request):
    data = await request.json()
    uid, count = data.get('user_id'), data.get('count')
    costs = {1: 100, 5: 500, 10: 1000, 40: 4000, 100: 10000}
    cost = costs.get(count)
    u = get_user(uid)
    if u['strawberry'] >= cost:
        conn = sqlite3.connect(DB_NAME)
        conn.execute("UPDATE users SET strawberry=strawberry-?, spins=spins+?, total_spent=total_spent+?, total_spins_bought=total_spins_bought+? WHERE user_id=?", 
                     (cost, count, cost, count, uid))
        conn.commit()
        conn.close()
        return web.json_response({"success": True})
    return web.json_response({"success": False})

async def api_upgrade(request):
    uid = (await request.json()).get('user_id')
    u = get_user(uid)
    nxt = u['click_level'] + 1
    cost = UPGRADE_COSTS.get(nxt, [999999, 0])[0]
    if u['strawberry'] >= cost:
        conn = sqlite3.connect(DB_NAME)
        conn.execute("UPDATE users SET strawberry=strawberry-?, click_level=? WHERE user_id=?", (cost, nxt, uid))
        conn.commit()
        conn.close()
        return web.json_response({"success": True})
    return web.json_response({"success": False})

async def api_spin(request):
    data = await request.json()
    return web.json_response(do_spins_logic(data.get('user_id'), data.get('count', 1)))

# --- СЕРВЕР ---
async def main():
    init_db()
    app = web.Application()
    app.router.add_get('/', lambda r: web.FileResponse('./webapp/index.html'))
    app.router.add_post('/api/get_user', api_get_user)
    app.router.add_post('/api/click', api_click)
    app.router.add_post('/api/buy', api_buy)
    app.router.add_post('/api/upgrade', api_upgrade)
    app.router.add_post('/api/spin', api_spin)
    app.router.add_post('/api/get_inventory', api_get_inventory)
    app.router.add_static('/', path='./webapp', show_index=False)
    
    runner = web.AppRunner(app)
    await runner.setup()
    await web.TCPSite(runner, '0.0.0.0', int(os.environ.get("PORT", 10000))).start()
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
