import sqlite3
import pandas as pd

def import_products_from_csv():
    print("Читаємо CSV файл...")
    df = pd.read_csv('skincare_clean_for_dasha.csv')
    
    conn = sqlite3.connect('skincode.db')
    cursor = conn.cursor()
    
    cursor.execute('DROP TABLE IF EXISTS products')
    
    cursor.execute('''
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(200) NOT NULL,
            brand VARCHAR(100),
            category VARCHAR(100),
            ingredients TEXT,
            country VARCHAR(100),
            effects TEXT  -- сюди запишемо колонку afterUse
        )
    ''')
    
    df = df.fillna('')
    products_data = []
    
    for index, row in df.iterrows():
        products_data.append((
            row['name'],
            row['brand'],
            row['type'],        
            row['ingredients'],
            row['country'],
            row['afterUse']     
        ))
        
    cursor.executemany('''
        INSERT INTO products (name, brand, category, ingredients, country, effects)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', products_data)
    
    conn.commit()
    conn.close()
    print(f"Успішно завантажено {len(products_data)} засобів у базу даних SkinCode!")

if __name__ == '__main__':
    import_products_from_csv()