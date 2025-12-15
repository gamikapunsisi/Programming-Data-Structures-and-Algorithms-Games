-- Drop existing tables
DROP TABLE IF EXISTS player_solutions;
DROP TABLE IF EXISTS performance_metrics;
DROP TABLE IF EXISTS all_solutions;
DROP TABLE IF EXISTS users;

-- Users table:  Store player information
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- All solutions table: Store all 92 pre-computed solutions
CREATE TABLE all_solutions (
    solution_id INT AUTO_INCREMENT PRIMARY KEY,
    queen_positions TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_solution (queen_positions(500))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Player solutions table: Store solutions found by players
CREATE TABLE player_solutions (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    queen_positions TEXT NOT NULL,
    found_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_solution (queen_positions(500)),
    INDEX idx_user_id (user_id),
    INDEX idx_found_at (found_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Performance metrics table: Store execution times
CREATE TABLE performance_metrics (
    metric_id INT AUTO_INCREMENT PRIMARY KEY,
    algorithm_type ENUM('sequential', 'threaded') NOT NULL,
    execution_time_ms DECIMAL(10, 2) NOT NULL,
    solutions_count INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_algorithm_type (algorithm_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;