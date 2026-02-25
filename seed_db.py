import sqlite3

def seed_products():
    # Наш стартовий каталог косметики
    products_data = [
        ("Зволожуючий лосьйон для сухої шкіри", "CeraVe", "Крем", "суха"),
        ("Очищувальний гель-піноутворювач", "CeraVe", "Очищення", "нормальна"),
        ("Заспокійлива сироватка з центеллою", "Purito", "Сироватка", "чутлива"),
        ("Саліцилова кислота 2%", "The Ordinary", "Актив", "жирна"),
        ("Сонцезахисний крем SPF 50", "Beauty of Joseon", "SPF", "всі типи"),
        ("Легкий зволожуючий гель-крем", "Neutrogena", "Крем", "комбінована")
    ]
    
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    
    # Використовуємо executemany для масового додавання
    cursor.executemany('''
        INSERT INTO products (name, brand, category, target_skin_type)
        VALUES (?, ?, ?, ?)
    ''', products_data)
    
    conn.commit()
    conn.close()
    print("Каталог засобів успішно завантажено в базу!")


if __name__ == '__main__':
    seed_products()