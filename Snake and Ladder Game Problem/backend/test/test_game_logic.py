from app import SnakeLadderGame

def test_board_creation():
    game = SnakeLadderGame(8)
    assert game.board_size == 64
    assert isinstance(game.snakes, dict)
    assert isinstance(game.ladders, dict)
    assert len(game.snakes) > 0
    assert len(game.ladders) > 0


def test_get_dest():
    game = SnakeLadderGame(6)
    # Manually set a ladder
    game.ladders = {5: 20}
    assert game.get_dest(5) == 20
    assert game.get_dest(7) == 7  # normal cell


def test_bfs_solution():
    game = SnakeLadderGame(6)
    result = game.solve_bfs()
    assert isinstance(result, int)
    assert result > 0


def test_dijkstra_solution():
    game = SnakeLadderGame(6)
    result = game.solve_dijkstra()
    assert isinstance(result, int)
    assert result > 0
