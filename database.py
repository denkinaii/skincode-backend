import sqlite3

def init_db():
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()

    # 1. Таблиця користувачів 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL
        )
    ''')

    # 2. Таблиця профілів 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS skin_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            
            -- 1. Базова інформація
            age_group VARCHAR(20),
            gender VARCHAR(30),
            
            -- 2-3. Тип та стан шкіри
            skin_type VARCHAR(50),
            combo_details TEXT,
            is_sensitive BOOLEAN,
            sensitivity_details TEXT,
            morning_state VARCHAR(100),
            after_wash_state VARCHAR(100),
            
            -- 4-8. Проблематика
            main_concern VARCHAR(100),
            dermatologist_diagnosis TEXT,
            breakouts_frequency VARCHAR(50),
            breakout_triggers TEXT,
            wrinkles_level VARCHAR(50),
            elasticity VARCHAR(50),
            has_pigmentation BOOLEAN,
            
            -- 9-10. Спосіб життя та здоров'я
            sugar_intake VARCHAR(50),
            sleep_quality VARCHAR(50),
            health_issues TEXT,
            supplements TEXT,
            
            -- 11. Специфічні ЖІНОЧІ питання (NULL якщо чоловік)
            menstrual_cycle_stage VARCHAR(50) NULL,
            pregnancy_status VARCHAR(50) NULL,
            lactation_status VARCHAR(50) NULL,
            
            -- 11. Специфічні ЧОЛОВІЧІ питання (NULL якщо жінка)
            shave_frequency VARCHAR(50) NULL,
            shave_reaction VARCHAR(100) NULL,
            has_beard VARCHAR(50) NULL,
            care_preference VARCHAR(100) NULL,
            
            -- 12-14. Догляд та бюджет
            current_routine TEXT,
            cosmetologist_visits VARCHAR(100),
            budget_expectation VARCHAR(50),
            additional_info TEXT,
            
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # 3. Таблиця продуктів 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            brand VARCHAR(100),
            category VARCHAR(50),
            target_skin_type VARCHAR(50)
        )
    ''')

    # 4. Історія перевірок інгредієнтів 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_name TEXT,
            ingredients_text TEXT NOT NULL,
            analysis_result TEXT,
            scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # 5. Таблиця щоденних логів 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            log_date DATE NOT NULL,
            
            morning_cleanser BOOLEAN DEFAULT 0,
            morning_moisturizer BOOLEAN DEFAULT 0,
            morning_spf BOOLEAN DEFAULT 0,
            
            evening_cleanser BOOLEAN DEFAULT 0,
            evening_moisturizer BOOLEAN DEFAULT 0,
            
            -- Трекер води (в мілілітрах)
            water_intake INTEGER DEFAULT 0,
            
            UNIQUE(user_id, log_date),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # 6. Таблиця улюблених засобів 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorite_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            
            UNIQUE(user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    ''')

    conn.commit()
    conn.close()
    print("База даних успішно ініціалізована!")

if __name__ == '__main__':
    init_db()