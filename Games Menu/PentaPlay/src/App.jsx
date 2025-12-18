const GAMES = [
  { id: 'snake', title: 'Snake & Ladder', emoji: '🐍', url: import.meta.env.VITE_SNAKE_URL },
  { id: 'traffic', title: 'Traffic Simulation', emoji: '🚦', url: import.meta.env.VITE_TRAFFIC_URL },
  { id: 'tsp', title: 'Traveling Salesman', emoji: '🧭', url: import.meta.env.VITE_TSP_URL },
  { id: 'hanoi', title: 'Tower of Hanoi', emoji: '🗼', url: import.meta.env.VITE_HANOI_URL },
  { id: 'queens', title: 'Eight Queens', emoji: '♛', url: import.meta.env.VITE_QUEENS_URL },
]

export default function App() {
  const openGame = (url) => {
    if (!url) return alert('Game URL not configured')
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page">
      <div className="panel">
        <header className="header">
          <h1>PentaPlay</h1>
          <p>Choose a game to play</p>
        </header>

        <main className="list">
          {GAMES.map((g) => (
            <button
              key={g.id}
              className="card"
              onClick={() => openGame(g.url)}
            >
              <span className="icon">{g.emoji}</span>
              <span className="title">{g.title}</span>
              <span className="open">Open</span>
            </button>
          ))}
        </main>

        <footer className="footer">
          All games open in a new tab
        </footer>
      </div>
    </div>
  )
}
