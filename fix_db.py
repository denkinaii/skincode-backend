import sqlite3

conn = sqlite3.connect('skincode.db')
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE skin_profiles ADD COLUMN sensitivity INTEGER DEFAULT 0")
    conn.commit()
    print("Колонку sensitivity успішно додано!")
except sqlite3.OperationalError:
    print("Схоже, колонка вже існує або сталася інша помилка.")

conn.close()