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
    water_intake: int = 0  

class WaterUpdate(BaseModel):
    user_id: int
    log_date: str  
    ml: int

class IngredientScan(BaseModel):
    user_id: int
    product_name: Optional[str] = "Невідомий засіб"
    ingredients_text: str
    analysis_result: str

class ChatRequest(BaseModel):
    user_id: int
    message: str

class FavoriteRequest(BaseModel):
    user_id: int
    product_id: int
    
class SkinProfileCreate(BaseModel):
    user_id: int
    age_group: str
    gender: str
    skin_type: str
    combo_details: Optional[str] = None
    is_sensitive: bool
    sensitivity_details: Optional[str] = None
    morning_state: str
    after_wash_state: str
    main_concern: str
    dermatologist_diagnosis: Optional[str] = None
    breakouts_frequency: str
    breakout_triggers: Optional[str] = None
    wrinkles_level: Optional[str] = None
    elasticity: Optional[str] = None
    has_pigmentation: bool
    sugar_intake: str
    sleep_quality: str
    health_issues: Optional[str] = None
    supplements: Optional[str] = None
    menstrual_cycle_stage: Optional[str] = None
    pregnancy_status: Optional[str] = None
    lactation_status: Optional[str] = None
    shave_frequency: Optional[str] = None
    shave_reaction: Optional[str] = None
    has_beard: Optional[str] = None
    care_preference: Optional[str] = None
    current_routine: str
    cosmetologist_visits: str
    budget_expectation: str
    additional_info: Optional[str] = None
    
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
                evening_cleanser, evening_moisturizer, water_intake
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            log.user_id, log.log_date,
            log.morning_cleanser, log.morning_moisturizer, log.morning_spf,
            log.evening_cleanser, log.evening_moisturizer, log.water_intake
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
            raise HTTPException(status_code=404, detail="Користувача не знайдено")
        
        cursor.execute('''
            REPLACE INTO skin_profiles (
                user_id, age_group, gender, skin_type, combo_details, is_sensitive,
                sensitivity_details, morning_state, after_wash_state, main_concern,
                dermatologist_diagnosis, breakouts_frequency, breakout_triggers,
                wrinkles_level, elasticity, has_pigmentation, sugar_intake,
                sleep_quality, health_issues, supplements, menstrual_cycle_stage,
                pregnancy_status, lactation_status, shave_frequency, shave_reaction,
                has_beard, care_preference, current_routine, cosmetologist_visits,
                budget_expectation, additional_info
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            profile.user_id, profile.age_group, profile.gender, profile.skin_type,
            profile.combo_details, profile.is_sensitive, profile.sensitivity_details,
            profile.morning_state, profile.after_wash_state, profile.main_concern,
            profile.dermatologist_diagnosis, profile.breakouts_frequency,
            profile.breakout_triggers, profile.wrinkles_level, profile.elasticity,
            profile.has_pigmentation, profile.sugar_intake, profile.sleep_quality,
            profile.health_issues, profile.supplements, profile.menstrual_cycle_stage,
            profile.pregnancy_status, profile.lactation_status, profile.shave_frequency,
            profile.shave_reaction, profile.has_beard, profile.care_preference,
            profile.current_routine, profile.cosmetologist_visits, profile.budget_expectation,
            profile.additional_info
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
            raise HTTPException(status_code=404, detail="Анкету не знайдено. Пройдіть тест!")
            
        profile = dict(profile_row)
        
        insights = []
        
        diet = profile.get('sugar_intake')
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


@app.post("/update-water")
def update_water(data: WaterUpdate):
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO daily_logs (user_id, log_date) 
            VALUES (?, ?)
        ''', (data.user_id, data.log_date))
        
        cursor.execute('''
            UPDATE daily_logs SET water_intake = water_intake + ? 
            WHERE user_id = ? AND log_date = ?
        ''', (data.ml, data.user_id, data.log_date))
        
        conn.commit()
        return {"message": f"Додано {data.ml} мл води!"}
    finally:
        conn.close()

@app.post("/save-scan")
def save_scan(scan: IngredientScan):
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO scan_history (user_id, product_name, ingredients_text, analysis_result)
            VALUES (?, ?, ?, ?)
        ''', (scan.user_id, scan.product_name, scan.ingredients_text, scan.analysis_result))
        conn.commit()
        return {"message": "Результат збережено в історію"}
    finally:
        conn.close()

@app.get("/recent-scans/{user_id}")
def get_recent_scans(user_id: int):
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT product_name, analysis_result, scan_date 
        FROM scan_history 
        WHERE user_id = ? 
        ORDER BY scan_date DESC LIMIT 5
    ''', (user_id,))
    scans = cursor.fetchall()
    conn.close()
    return [{"product": s[0], "result": s[1], "date": s[2]} for s in scans]


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)