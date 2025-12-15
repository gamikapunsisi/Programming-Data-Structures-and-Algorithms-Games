import json

def test_start_game_valid(client):
    response = client.post("/api/start-game", json={"n": 8})
    data = response.get_json()

    assert response.status_code == 200
    assert "snakes" in data
    assert "ladders" in data
    assert "choices" in data
    assert len(data["choices"]) == 3
    assert isinstance(data["correct_answer"], int)
    assert data["board_size"] == 8 * 8


def test_start_game_invalid_n(client):
    response = client.post("/api/start-game", json={"n": 3})
    assert response.status_code == 400
    assert "error" in response.get_json()


def test_save_result(client):
    response = client.post("/api/save-result", json={
        "name": "TestUser",
        "result": "Win"
    })

    data = response.get_json()
    assert response.status_code == 200
    assert data["status"] == "saved"
