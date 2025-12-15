import React, { useState } from "react";
import "./App.css";
import PerformanceChart from "./PerformanceChart";

export default function App() {
  const [gameState, setGameState] = useState("MENU");
  const [n, setN] = useState(10);
  const [gameData, setGameData] = useState(null);
  const [result, setResult] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [nameError, setNameError] = useState(""); // 🔥 For validation error message

  // 🔥 PERFORMANCE STATES
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);

  const startGame = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/start-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n: parseInt(n) }),
      });

      const data = await response.json();
      if (response.ok) {
        setGameData(data);
        setGameState("PLAYING");
        setSelectedConnection(null);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Backend not connected");
    }
  };

  // 🔥 LOAD PERFORMANCE DATA
  const loadPerformance = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/performance?limit=15");
      const data = await res.json();
      setPerformanceData(data);
      setShowPerformance(true);
    } catch {
      alert("Failed to load performance data");
    }
  };

  const toggleConnection = (square) => {
    if (!gameData) return;
    let start = null;
    let end = null;

    if (gameData.snakes[square]) {
      start = square;
      end = gameData.snakes[square];
    }
    if (gameData.ladders[square]) {
      start = square;
      end = gameData.ladders[square];
    }
    if (!start) {
      const snakeStart = Object.keys(gameData.snakes).find(
        (k) => gameData.snakes[k] === square
      );
      if (snakeStart) {
        start = parseInt(snakeStart);
        end = square;
      }

      const ladderStart = Object.keys(gameData.ladders).find(
        (k) => gameData.ladders[k] === square
      );
      if (ladderStart) {
        start = parseInt(ladderStart);
        end = square;
      }
    }

    if (!start || !end) return;

    if (
      selectedConnection &&
      selectedConnection.start === start &&
      selectedConnection.end === end
    ) {
      setSelectedConnection(null);
    } else {
      setSelectedConnection({ start, end });
    }
  };

  // Position of a square center in %
  const getPos = (sq) => {
    const size = Math.sqrt(gameData.board_size);
    const row = Math.floor((sq - 1) / size);
    let col = (sq - 1) % size;

    if (row % 2 === 1) col = size - 1 - col;

    const x = col * (100 / size) + 50 / size;
    const y = 100 - (row * (100 / size) + 50 / size);

    return { x, y };
  };

  const checkAnswer = async (choice) => {
    const isWin = choice === gameData.correct_answer;
    setResult(isWin ? "WIN" : "LOSE");
    setGameState("END");
  };

  const saveToDb = async () => {
    if (!playerName || !/^[A-Za-z]+$/.test(playerName)) {
      return setNameError("Invalid name! Only letters allowed.");
    }

    await fetch("http://localhost:5000/api/save-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName, result }),
    });

    alert("Saved!");
    setGameState("MENU");
    setPlayerName("");
    setNameError("");
  };

  // Squares in visual Style 1 order (bottom-left start, zig-zag)
  const buildVisualSquares = () => {
    if (!gameData) return [];
    const size = Math.sqrt(gameData.board_size);
    const rows = [];

    for (let renderRow = size - 1; renderRow >= 0; renderRow--) {
      const row = renderRow;
      const rowStart = row * size + 1;
      const rowNums = Array.from({ length: size }, (_, j) => {
        if (row % 2 === 0) return rowStart + j;
        return rowStart + (size - 1 - j);
      });
      rows.push(...rowNums);
    }

    return rows;
  };

  return (
    <div className="container">
      {gameState === "END" && <div className="modal-backdrop" />}

      <h1>🐍 Snake & Ladder Algo 🪜</h1>

      {/* 🔥 PERFORMANCE CHART MODAL */}
      {showPerformance && performanceData && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 100,
            }}
            onClick={() => setShowPerformance(false)}
          />

          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "800px",
              zIndex: 101,
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>📊 Algorithms Performance</h2>

            <PerformanceChart
              data={performanceData}
              onClose={() => setShowPerformance(false)}
            />

            <button
              style={{ marginTop: "15px", background: "#6b7280" }}
              onClick={() => setShowPerformance(false)}
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* MENU */}
      {gameState === "MENU" && (
        <div className="card">
          <label>
            <b>Board Size (N):</b>
          </label>
          <input
            type="number"
            min="6"
            max="12"
            value={n}
            onChange={(e) => setN(e.target.value)}
          />

          <button onClick={startGame}>Start Game</button>

          {/* 🔥 PERFORMANCE BUTTON */}
          <button
            style={{
              marginTop: "10px",
              marginLeft: "10px",
              background: "#2563eb",
            }}
            onClick={loadPerformance}
          >
            📊 Algorithms Performances
          </button>
        </div>
      )}

      {/* GAME BOARD */}
      {(gameState === "PLAYING" || gameState === "END") && gameData && (
        <div className="game-area">
          <div className="board-wrapper">
            <div
              className="board-grid"
              style={{
                gridTemplateColumns: `repeat(${Math.sqrt(
                  gameData.board_size
                )}, 1fr)`,
                position: "relative",
              }}
            >
              {buildVisualSquares().map((num) => {
                const isSnake =
                  gameData.snakes[num] ||
                  Object.values(gameData.snakes).includes(num);
                const isLadder =
                  gameData.ladders[num] ||
                  Object.values(gameData.ladders).includes(num);

                return (
                  <div
                    key={num}
                    className={`board-square ${isSnake ? "snake" : ""} ${
                      isLadder ? "ladder" : ""
                    }`}
                    onClick={() => toggleConnection(num)}
                    title={
                      isSnake ? "Snake" : isLadder ? "Ladder" : `Square ${num}`
                    }
                    style={{ position: "relative" }}
                  >
                    {isSnake && (
                      <span
                        style={{
                          position: "absolute",
                          opacity: 0.2,
                          fontSize: "1.5rem",
                        }}
                      >
                        🐍
                      </span>
                    )}
                    {isLadder && (
                      <span
                        style={{
                          position: "absolute",
                          opacity: 0.2,
                          fontSize: "1.5rem",
                        }}
                      >
                        🪜
                      </span>
                    )}
                    <span style={{ zIndex: 2 }}>{num}</span>
                  </div>
                );
              })}

              {selectedConnection && (
                <svg
                  className="line-overlay"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  {(() => {
                    const p1 = getPos(selectedConnection.start);
                    const p2 = getPos(selectedConnection.end);
                    const isSnake =
                      selectedConnection.start > selectedConnection.end;
                    return (
                      <line
                        x1={`${p1.x}%`}
                        y1={`${p1.y}%`}
                        x2={`${p2.x}%`}
                        y2={`${p2.y}%`}
                        stroke={
                          isSnake
                            ? "rgba(239, 68, 68, 0.8)"
                            : "rgba(16, 185, 129, 0.8)"
                        }
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    );
                  })()}
                </svg>
              )}
            </div>
          </div>

          <div className="right-panel">
            <h3>Stats Board</h3>
            <p>
              <strong>Board Size:</strong> {Math.sqrt(gameData.board_size)} ×{" "}
              {Math.sqrt(gameData.board_size)}
            </p>

            <div className="lists">
              <div>
                <h4 style={{ color: "#ef4444" }}>🐍 Snakes</h4>
                <ul>
                  {Object.entries(gameData.snakes).map(([s, e]) => (
                    <li key={s}>
                      {s} ↘ {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ color: "#10b981" }}>🪜 Ladders</h4>
                <ul>
                  {Object.entries(gameData.ladders).map(([s, e]) => (
                    <li key={s}>
                      {s} ↗ {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="question-panel">
              <h2>🎲 Minimum Dice Throws?</h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  marginBottom: "15px",
                }}
              >
                Calculate the BFS & Dijkstra shortest path:
              </p>
              {gameData.choices.map((c) => (
                <button key={c} onClick={() => checkAnswer(c)}>
                  {c} Throws
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* END MODAL */}
      {gameState === "END" && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 99,
            }}
            onClick={() => setGameState("MENU")}
          />

          <div className={`result-card ${result}`}>
            <h1 style={{ margin: 0, fontSize: "3rem" }}>
              {result === "WIN" ? "🎉" : "💀"}
            </h1>
            <h2>{result === "WIN" ? "Correct Answer!" : "Game Over"}</h2>
            <p>
              The shortest path was: <b>{gameData.correct_answer}</b>
            </p>

            {result === "WIN" && (
              <div className="save-form">
                <input
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z]*$/.test(value)) {
                      setPlayerName(value);
                      setNameError("");
                    } else {
                      setNameError("Name must contain only letters A–Z.");
                    }
                  }}
                />
                {nameError && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "0.8rem",
                      marginTop: "5px",
                    }}
                  >
                    {nameError}
                  </p>
                )}
                <button
                  onClick={() => {
                    if (!playerName || !/^[A-Za-z]+$/.test(playerName)) {
                      return setNameError(
                        "Invalid name! Only letters allowed."
                      );
                    }
                    saveToDb();
                  }}
                >
                  Save Score
                </button>
              </div>
            )}

            <br />
            <button
              style={{ background: "#6b7280" }}
              onClick={() => setGameState("MENU")}
            >
              Try Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}
