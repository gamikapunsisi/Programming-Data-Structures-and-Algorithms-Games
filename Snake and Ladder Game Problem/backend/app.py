# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random

from game_logic import SnakeLadderGame
from database import (
    init_db,
    save_result_to_db,
    save_performance,
    get_performance
)
from validators import validate_n, validate_save_result

app = Flask(__name__)
CORS(app)

init_db()


@app.route("/api/start-game", methods=["POST"])
def start_game():
    try:
        data = request.json or {}
        n = validate_n(int(data.get("n", 10)))

        game = SnakeLadderGame(n)
        run_id = int(time.time() * 1000)

        # BFS
        t0 = time.perf_counter_ns()
        ans = game.solve_bfs()
        t1 = time.perf_counter_ns()
        save_performance(run_id, "BFS", t1 - t0)

        # Dijkstra
        t0 = time.perf_counter_ns()
        game.solve_dijkstra()
        t1 = time.perf_counter_ns()
        save_performance(run_id, "Dijkstra", t1 - t0)

        choices = {ans}
        while len(choices) < 3:
            fake = ans + random.randint(-3, 3)
            if fake > 0:
                choices.add(fake)

        choices = list(choices)
        random.shuffle(choices)

        return jsonify({
            "snakes": game.snakes,
            "ladders": game.ladders,
            "board_size": game.board_size,
            "choices": choices,
            "correct_answer": ans,
            "run_id": run_id
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/save-result", methods=["POST"])
def save_result():
    try:
        data = validate_save_result(request.json or {})
        save_result_to_db(data["name"], data["result"])
        return jsonify({"status": "saved"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔥 NEW PERFORMANCE API
@app.route("/api/performance", methods=["GET"])
def performance():
    limit = int(request.args.get("limit", 15))
    rows = get_performance(limit)

    runs = {}
    for run_id, algo, time_ns in rows:
        runs.setdefault(run_id, {})[algo] = round(time_ns / 1_000_000, 2)

    # Sort runs chronologically
    sorted_runs = sorted(runs.items())

    rounds = []
    series = {}

    for i, (_, data) in enumerate(sorted_runs):
        rounds.append(f"Round {i+1}")
        for algo, time_ms in data.items():
            series.setdefault(algo, []).append(time_ms)

    return jsonify({
        "rounds": rounds,
        "series": series
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
