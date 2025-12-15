# database.py
import sqlite3

DB_NAME = "snakeladder.db"


def get_connection():
    return sqlite3.connect(DB_NAME)


def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS player_stats (
            id INTEGER PRIMARY KEY,
            player_name TEXT,
            result TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS algo_performance1 (
            id INTEGER PRIMARY KEY,
            run_id INTEGER,
            algo_name TEXT,
            time_ns INTEGER
        )
    """)

    conn.commit()
    conn.close()


def save_result_to_db(name, result):
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO player_stats (player_name, result) VALUES (?, ?)",
        (name, result)
    )
    conn.commit()
    conn.close()


def save_performance(run_id, algo, time_ns):
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO algo_performance1 (run_id, algo_name, time_ns) VALUES (?, ?, ?)",
        (run_id, algo, time_ns)
    )
    conn.commit()
    conn.close()


def get_performance(limit=15):
    """
    Returns latest N rounds of performance data
    """
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        SELECT run_id, algo_name, time_ns
        FROM algo_performance1
        ORDER BY run_id DESC
        LIMIT ?
    """, (limit * 2,))  # 2 algorithms per run

    rows = c.fetchall()
    conn.close()

    return rows
