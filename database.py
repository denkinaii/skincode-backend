import sqlite3

def init_db():
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS skin_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            
            -- Базові дані
            gender VARCHAR(20),       -- 'female', 'male', 'other'
            age INTEGER,              -- Вік (наприклад, 19)
            skin_type VARCHAR(50),    -- 'суха', 'жирна', 'комбінована', 'нормальна'
            is_sensitive BOOLEAN,     -- Чутливість: 1 (True) або 0 (False)
            
            -- Глибокий аналіз
            main_concern VARCHAR(100),       -- Головна проблема (акне, зморшки тощо)
            breakouts_frequency VARCHAR(50), -- Як часто висипання (постійно, перед циклом, рідко)
            diet_quality VARCHAR(100),       -- Харчування (наприклад: 'багато цукру', 'збалансоване')
            sleep_quality VARCHAR(50),       -- Сон ('менше 6 годин', 'норма')
            health_issues TEXT,              -- Проблеми зі здоров'ям (шлунок, гормони)
            allergies TEXT,                  -- Алергії на компоненти
            
            -- Специфічні жіночі питання (дозволяємо залишати порожнім)
            menstrual_cycle_stage VARCHAR(50) NULL, -- Фаза циклу (фолікулярна, лютеїнова тощо)
            
            -- Догляд
            current_routine TEXT,            -- Чим зараз користується (можна зберігати як текст або JSON)
            
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            brand VARCHAR(100),
            category VARCHAR(50),
            target_skin_type VARCHAR(50)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            log_date DATE NOT NULL,
            
            -- Відмітки для ранку (0 - не зроблено, 1 - зроблено)
            morning_cleanser BOOLEAN DEFAULT 0,
            morning_moisturizer BOOLEAN DEFAULT 0,
            morning_spf BOOLEAN DEFAULT 0,
            
            -- Відмітки для вечора
            evening_cleanser BOOLEAN DEFAULT 0,
            evening_moisturizer BOOLEAN DEFAULT 0,
            
            -- Це важливо: один юзер може мати лише один запис на один день
            UNIQUE(user_id, log_date),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorite_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            
            -- Захист від дублів: не можна додати одну баночку двічі
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