import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function PerformanceChart({ data, onClose }) {
  const chartData = {
    labels: data.rounds,
    datasets: [
      {
        label: "BFS Algorithm ",
        data: data.series.BFS,
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.4,
      },
      {
        label: "Dijkstra Algorithm ",
        data: data.series.Dijkstra,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="performance-modal">
        <h2>Algorithm Performance Comparison</h2>
        <p style={{ color: "#94a3b8" }}>
          15 Rounds Performance Comparison
        </p>

        <Line data={chartData} />

        <button style={{ marginTop: "15px" }} onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}
