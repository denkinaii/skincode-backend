from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
from database import init_db
from typing import Optional
from google import genai
import os
from dotenv import load_dotenv
from datetime import date, timedelta

load_dotenv()
app = FastAPI()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

init_db()

class DailyLogCreate(BaseModel):
    user_id: int
    log_date: date
    morning_cleanser: bool = False
    morning_moisturizer: bool = False
    morning_spf: bool = False
    evening_cleanser: bool = False
    evening_moisturizer: bool = False

class ChatRequest(BaseModel):
    user_id: int
    message: str

class FavoriteRequest(BaseModel):
    user_id: int
    product_id: int
    
class SkinProfileCreate(BaseModel):
    user_id: int
    gender: Optional[str] = None
    age: Optional[int] = None
    skin_type: Optional[str] = None
    is_sensitive: Optional[bool] = None
    main_concern: Optional[str] = None
    breakouts_frequency: Optional[str] = None
    diet_quality: Optional[str] = None
    sleep_quality: Optional[str] = None
    health_issues: Optional[str] = None
    allergies: Optional[str] = None
    menstrual_cycle_stage: Optional[str] = None
    current_routine: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str 


def get_user_skin_profile(user_id: int):
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT skin_type, is_sensitive, main_concern, current_routine 
        FROM skin_profiles 
        WHERE user_id = ?
    """, (user_id,))
    
    profile = cursor.fetchone()
    conn.close()
    
    if profile:
        return {
            "skin_type": profile[0],
            "sensitivity": profile[1],
            "concerns": profile[2],
            "routine": profile[3]
        }
    return None

@app.get("/")
def read_root():
    return {"message": "Welcome to SkinCode API!"}


@app.post("/favorites")
def toggle_favorite(req: FavoriteRequest):
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id FROM favorite_products WHERE user_id = ? AND product_id = ?', (req.user_id, req.product_id))
        exists = cursor.fetchone()
        
        if exists:
            cursor.execute('DELETE FROM favorite_products WHERE id = ?', (exists[0],))
            message = "Видалено з улюблених 💔"
        else:
            cursor.execute('INSERT INTO favorite_products (user_id, product_id) VALUES (?, ?)', (req.user_id, req.product_id))
            message = "Додано в улюблені ❤️"
            
        conn.commit()
        return {"message": message}
    finally:
        conn.close()

@app.get("/favorites/{user_id}")
def get_user_favorites(user_id: int):
    conn = sqlite3.connect('skincode.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT p.* FROM products p
        JOIN favorite_products f ON p.id = f.product_id
        WHERE f.user_id = ?
    ''', (user_id,))
    
    favorites = cursor.fetchall()
    conn.close()
    
    return {"favorites": [dict(row) for row in favorites]}


@app.post("/daily-log")
def save_daily_log(log: DailyLogCreate):
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            REPLACE INTO daily_logs (
                user_id, log_date, 
                morning_cleanser, morning_moisturizer, morning_spf,
                evening_cleanser, evening_moisturizer
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            log.user_id, log.log_date,
            log.morning_cleanser, log.morning_moisturizer, log.morning_spf,
            log.evening_cleanser, log.evening_moisturizer
        ))
        
        conn.commit()
        return {"message": "Відмітки успішно збережено!", "date": log.log_date}
        
    finally:
        conn.close()
        

@app.get("/streak/{user_id}")
def get_user_streak(user_id: int):
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT log_date FROM daily_logs 
        WHERE user_id = ? AND (
            morning_cleanser = 1 OR morning_moisturizer = 1 OR morning_spf = 1 OR 
            evening_cleanser = 1 OR evening_moisturizer = 1
        )
        ORDER BY log_date DESC
    ''', (user_id,))
    
    dates = cursor.fetchall()
    conn.close()
    
    if not dates:
        return {"streak": 0}
        
    log_dates = sorted(list(set(date.fromisoformat(row[0]) for row in dates)), reverse=True)
    
    streak = 0
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    if today in log_dates:
        current_check = today
    elif yesterday in log_dates:
        current_check = yesterday
    else:
        return {"streak": 0} 
        
    for log_date in log_dates:
        if log_date == current_check:
            streak += 1
            current_check -= timedelta(days=1) 
        elif log_date < current_check:
            break 
            
    return {"streak": streak}


@app.post("/register")
def register_user(user: UserCreate):
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        ''', (user.username, user.email, user.password)) 
        
        conn.commit()
        new_user_id = cursor.lastrowid 
        
        return {"message": "Користувача успішно створено!", "user_id": new_user_id}
        
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Користувач з таким email вже існує")
        
    finally:
        conn.close()

@app.post("/submit-quiz")
def submit_quiz(profile: SkinProfileCreate):
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id FROM users WHERE id = ?', (profile.user_id,))
        if not cursor.fetchone():
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Користувача не знайдено")
        
        cursor.execute('''
            REPLACE INTO skin_profiles (
                user_id, gender, age, skin_type, is_sensitive, main_concern,
                breakouts_frequency, diet_quality, sleep_quality, health_issues,
                allergies, menstrual_cycle_stage, current_routine
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            profile.user_id, profile.gender, profile.age, profile.skin_type,
            profile.is_sensitive, profile.main_concern, profile.breakouts_frequency,
            profile.diet_quality, profile.sleep_quality, profile.health_issues,
            profile.allergies, profile.menstrual_cycle_stage, profile.current_routine
        ))
        
        conn.commit()
        return {"message": "Анкету успішно збережено та проаналізовано!"}
        
    finally:
        conn.close()

@app.get("/products")
def get_products(
    brand: Optional[str] = None,
    category: Optional[str] = None,
    skin_type: Optional[str] = None,
    search: Optional[str] = None
):
    conn = sqlite3.connect('skincode.db')
    conn.row_factory = sqlite3.Row 
    cursor = conn.cursor()
    
    query = "SELECT * FROM products WHERE 1=1"
    params = []
    
    if brand:
        query += " AND brand = ?"
        params.append(brand)
        
    if category:
        query += " AND category = ?"
        params.append(category)
        
    if skin_type:
        query += " AND (target_skin_type = ? OR target_skin_type = 'всі типи')"
        params.append(skin_type)
        
    if search:
        query += " AND name LIKE ?"
        params.append(f"%{search}%") 
        
    cursor.execute(query, params)
    products = cursor.fetchall()
    
    conn.close()
    
    return {"products": [dict(row) for row in products]}


@app.get("/recommendations/{user_id}")
def get_smart_recommendations(user_id: int):
    conn = sqlite3.connect('skincode.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM skin_profiles WHERE user_id = ?', (user_id,))
        profile_row = cursor.fetchone()
        
        if not profile_row:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Анкету не знайдено. Пройдіть тест!")
            
        profile = dict(profile_row)
        
        insights = []
        
        diet = profile.get('diet_quality')
        if diet and ('цукор' in diet.lower() or 'швидкі вуглеводи' in diet.lower()):
            insights.append("💡 Інсайт: Регулярне вживання цукру та швидких вуглеводів може провокувати глікацію (руйнування колагену) та запалення. Спробуй збалансувати раціон повільними вуглеводами та білком.")
            
        sleep = profile.get('sleep_quality')
        if sleep and 'менше 6 годин' in sleep.lower():
            insights.append("🌙 Інсайт: Нестача сну підвищує рівень кортизолу, що змушує шкіру виділяти більше себуму. Це може бути причиною висипань.")
            
        if profile.get('gender') == 'female':
            cycle = profile.get('menstrual_cycle_stage')
            if cycle and 'лютеїнова' in cycle.lower():
                insights.append("🌸 Інсайт: Перед початком циклу сальні залози працюють активніше. Додай у рутину м'яке відлущування (наприклад, ензимну пудру або легкі кислоти).")
                
        if not insights:
            insights.append("✨ Інсайт: Твої показники в нормі! Продовжуй підтримувати базовий захист та зволоження шкіри.")

        skin_type = profile.get('skin_type')
        cursor.execute('''
            SELECT name, brand, category, target_skin_type 
            FROM products 
            WHERE target_skin_type = ? OR target_skin_type = 'всі типи'
        ''', (skin_type,))
        
        products = [dict(row) for row in cursor.fetchall()]
        
        return {
            "user_id": user_id,
            "analysis_insights": insights,
            "recommended_products": products
        }
        
    finally:
        conn.close()
        
        
@app.post("/chat")
def chat_with_skinny(request: ChatRequest):
    system_prompt = """
    Ти — Skinny, веселий та експертний AI-асистент додатку SkinCode.
    Твоя мета — допомагати користувачам з доглядом за шкірою. 
    Використовуй емодзі. Спілкуйся українською мовою, дружньо і сучасно. 
    Ти знаєш, що цукор шкодить колагену, а сонцезахист (SPF) — це обов'язкова база.
    Відповідай лаконічно, не пиши величезні поеми.
    """
    
    user_profile = get_user_skin_profile(request.user_id)
    
    if user_profile:
        context = f"""
        ОСЬ ІНФОРМАЦІЯ ПРО КОРИСТУВАЧА, З ЯКИМ ТИ ГОВОРИШ:
        - Тип шкіри: {user_profile['skin_type']}
        - Чутливість: {'Так, шкіра чутлива' if user_profile['sensitivity'] else 'Ні, шкіра не чутлива'}
        - Головні проблеми: {user_profile['concerns']}
        - Поточний догляд: {user_profile['routine']}
        
        Враховуй ці дані у своїх відповідях, але не перераховуй їх просто так. 
        Давай поради, які підходять саме для такого типу шкіри.
        """
        system_prompt += context
    else:
        system_prompt += "\nКористувач ще не заповнив анкету. М'яко порадь йому пройти тест для кращих рекомендацій."

    full_prompt = f"{system_prompt}\n\nКористувач питає: {request.message}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash', 
            contents=full_prompt
        )
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)