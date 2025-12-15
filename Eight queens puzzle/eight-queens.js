/**
 * Eight Queens Puzzle Game - Complete Frontend Logic with 15-Round Testing
 * Version: 3.1 - Enhanced Chart Display
 */

// ==================== GLOBAL VARIABLES ====================
let grid = [];
let queens = [];
const API_BASE_URL = 'http://localhost:3000';
let performanceChart = null;

// DOM Elements
let chessboardElement = null;
let usernameInput = null;
let resetButton = null;
let computeButton = null;
let compareButton = null;
let run15RoundsButton = null;
let queensPlacedDisplay = null;
let solutionsFoundDisplay = null;
let performanceSection = null;
let sequentialTimeDisplay = null;
let threadedTimeDisplay = null;
let winnerMessage = null;
let loading = null;
let notification = null;

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('Initializing Eight Queens Puzzle Game...');
    initializeDOMElements();
    
    if (!chessboardElement || !usernameInput) {
      throw new Error('Required DOM elements not found');
    }
    
    setupEventListeners();
    setupChartCloseButton();
    initializeBoard();
    loadSolutionsCount();
    
    console.log('✓ Game initialized successfully');
  } catch (error) {
    console.error('✗ Initialization error:', error);
    alert('Error initializing game. Please refresh the page.');
  }
});

function initializeDOMElements() {
  chessboardElement = document.getElementById('chessboard');
  usernameInput = document.getElementById('username');
  resetButton = document.getElementById('resetButton');
  computeButton = document.getElementById('computeButton');
  compareButton = document.getElementById('compareButton');
  run15RoundsButton = document.getElementById('run15RoundsButton');
  queensPlacedDisplay = document.getElementById('queensPlaced');
  solutionsFoundDisplay = document.getElementById('solutionsFound');
  performanceSection = document.getElementById('performanceSection');
  sequentialTimeDisplay = document.getElementById('sequentialTime');
  threadedTimeDisplay = document.getElementById('threadedTime');
  winnerMessage = document.getElementById('winnerMessage');
  loading = document.getElementById('loading');
  notification = document.getElementById('notification');
  
  console.log('✓ DOM elements initialized');
}

function setupEventListeners() {
  if (resetButton) {
    resetButton.addEventListener('click', handleResetClick);
  }
  
  if (computeButton) {
    computeButton.addEventListener('click', handleComputeClick);
  }
  
  if (compareButton) {
    compareButton.addEventListener('click', handleCompareClick);
  }
  
  if (run15RoundsButton) {
    run15RoundsButton.addEventListener('click', handleRun15Rounds);
  }
  
  console.log('✓ Event listeners setup');
}

function setupChartCloseButton() {
  const closeButton = document.getElementById('closeChartButton');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      hidePerformanceChart();
      showNotification('Chart closed', 'success');
    });
  }
}

// ==================== BOARD MANAGEMENT ====================

function initializeBoard() {
  try {
    if (!chessboardElement) {
      throw new Error('Chessboard element not found');
    }

    chessboardElement.innerHTML = '';
    grid = [];
    queens = [];
    updateQueensPlaced();

    for (let row = 0; row < 8; row++) {
      const rowArray = [];
      for (let col = 0; col < 8; col++) {
        const button = createBoardCell(row, col);
        chessboardElement.appendChild(button);
        rowArray.push(button);
      }
      grid.push(rowArray);
    }

    console.log('✓ Board initialized: 8x8 grid created');
  } catch (error) {
    console.error('Error initializing board:', error);
    showNotification('Error creating game board', 'error');
  }
}

function createBoardCell(row, col) {
  const button = document.createElement('button');
  button.setAttribute('data-row', row);
  button.setAttribute('data-col', col);
  button.setAttribute('aria-label', 'Cell row ' + (row + 1) + ' column ' + (col + 1));
  
  button.addEventListener('click', function() {
    handleCellClick(row, col);
  });
  
  return button;
}

function resetBoard() {
  try {
    queens = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (grid[row] && grid[row][col]) {
          grid[row][col].innerText = '';
          grid[row][col].classList.remove('has-queen', 'threatened', 'hover-threatened');
        }
      }
    }
    
    updateQueensPlaced();
    hideWinnerMessage();
    hidePerformanceSection();
    
    console.log('✓ Board reset');
  } catch (error) {
    console.error('Error resetting board:', error);
    showNotification('Error resetting board', 'error');
  }
}

// ==================== CELL INTERACTION ====================

function handleCellClick(row, col) {
  try {
    const username = usernameInput.value.trim();
    
    if (!username) {
      showNotification('Please enter a username before placing a queen.', 'warning');
      usernameInput.focus();
      return;
    }

    if (username.length < 3) {
      showNotification('Username must be at least 3 characters long.', 'warning');
      usernameInput.focus();
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      showNotification('Username can only contain letters, numbers, underscores, and hyphens.', 'warning');
      return;
    }

    if (grid[row][col].classList.contains('has-queen')) {
      showNotification('This cell already has a queen!', 'warning');
      return;
    }

    if (isThreatened(row, col)) {
      showThreatenedCells(row, col);
      showNotification('Cannot place a queen that threatens another queen! Board will reset.', 'error');
      
      setTimeout(function() {
        resetBoard();
      }, 1500);
      return;
    }

    placeQueen(row, col);

    if (queens.length === 8) {
      setTimeout(function() {
        submitSolution(username);
      }, 500);
    }

  } catch (error) {
    console.error('Error in handleCellClick:', error);
    showNotification('An error occurred while placing the queen.', 'error');
  }
}

// ==================== QUEEN LOGIC ====================

function isThreatened(row, col) {
  try {
    for (let i = 0; i < queens.length; i++) {
      const qRow = queens[i][0];
      const qCol = queens[i][1];
      
      if (qRow === row) {
        return true;
      }
      
      if (qCol === col) {
        return true;
      }
      
      const rowDiff = Math.abs(qRow - row);
      const colDiff = Math.abs(qCol - col);
      if (rowDiff === colDiff) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in isThreatened:', error);
    return true;
  }
}

function showThreatenedCells(row, col) {
  try {
    grid[row][col].classList.add('threatened');
    
    for (let i = 0; i < queens.length; i++) {
      const qRow = queens[i][0];
      const qCol = queens[i][1];
      
      if (qRow === row || qCol === col || 
          Math.abs(qRow - row) === Math.abs(qCol - col)) {
        grid[qRow][qCol].classList.add('threatened');
      }
    }
  } catch (error) {
    console.error('Error in showThreatenedCells:', error);
  }
}

function placeQueen(row, col) {
  try {
    grid[row][col].innerText = '♕';
    grid[row][col].classList.add('has-queen');
    queens.push([row, col]);
    updateQueensPlaced();
    
    console.log('✓ Queen placed at (' + row + ', ' + col + ')');
  } catch (error) {
    console.error('Error placing queen:', error);
    showNotification('Error placing queen', 'error');
  }
}

function updateQueensPlaced() {
  try {
    if (queensPlacedDisplay) {
      queensPlacedDisplay.textContent = queens.length;
    }
  } catch (error) {
    console.error('Error updating queens placed:', error);
  }
}

// ==================== API CALLS ====================

async function submitSolution(username) {
  try {
    showLoading();
    
    const sortedQueens = queens.slice().sort(function(a, b) {
      return a[0] - b[0];
    });
    
    console.log('Submitting solution:', sortedQueens);
    
    const response = await fetch(API_BASE_URL + '/submit-solution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        queenPositions: sortedQueens
      }),
    });

    const data = await response.json();
    hideLoading();

    if (response.ok) {
      showNotification(data.message, 'success');
      showWinnerMessage(data.message);
      loadSolutionsCount();
      
      setTimeout(function() {
        resetBoard();
      }, 3000);
    } else {
      showNotification(data.message, 'error');
      
      setTimeout(function() {
        resetBoard();
      }, 2000);
    }

  } catch (error) {
    hideLoading();
    console.error('Error submitting solution:', error);
    
    if (error.message.includes('Failed to fetch')) {
      showNotification('Cannot connect to server. Please ensure the server is running on port 3000.', 'error');
    } else {
      showNotification('Error submitting solution. Please try again.', 'error');
    }
  }
}

async function computeAllSolutions() {
  try {
    showLoading();
    console.log('Computing all solutions...');
    
    const response = await fetch(API_BASE_URL + '/compute-solutions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    hideLoading();

    if (response.ok) {
      showNotification('Successfully computed ' + data.solutionsCount + ' solutions!', 'success');
      console.log('Sequential time:', data.sequential.time, 'ms');
      console.log('Threaded time:', data.threaded.time, 'ms');
      loadSolutionsCount();
      
      const performanceData = {
        sequentialTime: data.sequential.time,
        threadedTime: data.threaded.time,
        solutionsCount: data.solutionsCount
      };
      
      displayPerformanceComparison(performanceData);
      displayPerformanceChart(performanceData);
    } else {
      showNotification(data.message || 'Error computing solutions', 'error');
    }

  } catch (error) {
    hideLoading();
    console.error('Error computing solutions:', error);
    
    if (error.message.includes('Failed to fetch')) {
      showNotification('Cannot connect to server. Please ensure the server is running on port 3000.', 'error');
    } else {
      showNotification('Error computing solutions. Please try again.', 'error');
    }
  }
}

async function comparePerformance() {
  try {
    showLoading();
    console.log('Comparing performance...');
    
    const response = await fetch(API_BASE_URL + '/compare-performance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    hideLoading();

    if (response.ok) {
      displayPerformanceComparison(data);
      displayPerformanceChart(data);
      showNotification('Performance comparison completed!', 'success');
      console.log('Performance data:', data);
    } else {
      showNotification(data.message || 'Error comparing performance. Please compute solutions first.', 'warning');
    }

  } catch (error) {
    hideLoading();
    console.error('Error comparing performance:', error);
    
    if (error.message.includes('Failed to fetch')) {
      showNotification('Cannot connect to server. Please ensure the server is running on port 3000.', 'error');
    } else {
      showNotification('Error comparing performance. Please try again.', 'error');
    }
  }
}

async function handleRun15Rounds() {
  try {
    showLoading();
    console.log('Starting 15-round performance test...');
    
    const response = await fetch(API_BASE_URL + '/run-15-rounds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    hideLoading();

    if (response.ok) {
      showNotification('15-round performance test completed!', 'success');
      console.log('15 Rounds Data:', data);
      
      display15RoundsChart(data);
      
      displayPerformanceComparison({
        sequentialTime: data.statistics.sequential.average,
        threadedTime: data.statistics.threaded.average,
        solutionsCount: 92
      });
      
    } else {
      showNotification(data.message || 'Error running 15-round test', 'error');
    }

  } catch (error) {
    hideLoading();
    console.error('Error in 15-round test:', error);
    
    if (error.message.includes('Failed to fetch')) {
      showNotification('Cannot connect to server. Please ensure the server is running on port 3000.', 'error');
    } else {
      showNotification('Error running 15-round test. Please try again.', 'error');
    }
  }
}

function displayPerformanceComparison(data) {
  try {
    if (!performanceSection || !sequentialTimeDisplay || !threadedTimeDisplay) {
      console.warn('Performance display elements not found');
      return;
    }

    sequentialTimeDisplay.textContent = data.sequentialTime.toFixed(2);
    threadedTimeDisplay.textContent = data.threadedTime.toFixed(2);
    
    performanceSection.classList.add('visible');
    
    const speedup = (data.sequentialTime / data.threadedTime).toFixed(2);
    console.log('Speedup: ' + speedup + 'x');
  } catch (error) {
    console.error('Error displaying performance comparison:', error);
  }
}

function hidePerformanceSection() {
  try {
    if (performanceSection) {
      performanceSection.classList.remove('visible');
    }
  } catch (error) {
    console.error('Error hiding performance section:', error);
  }
}

async function loadSolutionsCount() {
  try {
    const response = await fetch(API_BASE_URL + '/solutions-count');
    const data = await response.json();
    
    if (response.ok && solutionsFoundDisplay) {
      solutionsFoundDisplay.textContent = data.count;
      console.log('Solutions found: ' + data.count + '/92');
    }
  } catch (error) {
    console.error('Error loading solutions count:', error);
  }
}

// ==================== CHART FUNCTIONALITY ====================

function displayPerformanceChart(data) {
  try {
    const chartSection = document.getElementById('chartSection');
    const canvas = document.getElementById('performanceChart');
    const speedupElement = document.getElementById('speedupValue');
    const winnerElement = document.getElementById('winnerAlgorithm');
    const solutionsElement = document.getElementById('chartSolutionsCount');
    
    if (!chartSection || !canvas) {
      console.warn('Chart elements not found');
      return;
    }

    const sequentialTime = parseFloat(data.sequentialTime);
    const threadedTime = parseFloat(data.threadedTime);
    const speedup = (sequentialTime / threadedTime).toFixed(2);
    const winner = threadedTime < sequentialTime ? 'Threaded 🏆' : 'Sequential 🏆';
    const solutionsCount = data.solutionsCount || 92;

    if (speedupElement) speedupElement.textContent = speedup + 'x';
    if (winnerElement) winnerElement.textContent = winner;
    if (solutionsElement) solutionsElement.textContent = solutionsCount;

    chartSection.classList.add('visible');

    if (performanceChart) {
      performanceChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    performanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Sequential Algorithm', 'Threaded Algorithm'],
        datasets: [{
          label: 'Execution Time (ms)',
          data: [sequentialTime, threadedTime],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(16, 185, 129, 1)'
          ],
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 80
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#e2e8f0',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: 20
            }
          },
          title: {
            display: true,
            text: 'Algorithm Performance: Finding All 92 Solutions',
            color: '#60a5fa',
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: 20
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#60a5fa',
            bodyColor: '#e2e8f0',
            borderColor: '#60a5fa',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed.y.toFixed(2) + ' ms';
                return label;
              },
              afterLabel: function(context) {
                const percent = ((context.parsed.y / (sequentialTime + threadedTime)) * 100).toFixed(1);
                return 'Percentage: ' + percent + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#94a3b8',
              font: {
                size: 12
              },
              callback: function(value) {
                return value + ' ms';
              }
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              color: '#e2e8f0',
              font: {
                size: 13,
                weight: 'bold'
              }
            },
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart'
        }
      }
    });

    console.log('✓ Performance chart displayed');
    
    setTimeout(function() {
      chartSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

  } catch (error) {
    console.error('Error displaying performance chart:', error);
    showNotification('Error displaying chart', 'error');
  }
}

function display15RoundsChart(data) {
  try {
    const chartSection = document.getElementById('chartSection');
    const canvas = document.getElementById('performanceChart');
    const speedupElement = document.getElementById('speedupValue');
    const winnerElement = document.getElementById('winnerAlgorithm');
    const solutionsElement = document.getElementById('chartSolutionsCount');
    
    if (!chartSection || !canvas) {
      console.warn('Chart elements not found');
      return;
    }

    const stats = data.statistics;
    const speedup = stats.speedup;
    const winner = stats.threaded.average < stats.sequential.average ? 'Threaded 🏆' : 'Sequential 🏆';

    if (speedupElement) speedupElement.textContent = speedup + 'x';
    if (winnerElement) winnerElement.textContent = winner;
    if (solutionsElement) solutionsElement.textContent = '92 (×15 rounds)';

    chartSection.classList.add('visible');

    if (performanceChart) {
      performanceChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // Prepare data for line chart
    const roundLabels = [];
    for (let i = 1; i <= 15; i++) {
      roundLabels.push('Round ' + i);
    }
    
    performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: roundLabels,
        datasets: [
          {
            label: 'Sequential Algorithm',
            data: data.sequentialTimes,
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgba(239, 68, 68, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Threaded Algorithm',
            data: data.threadedTimes,
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#e2e8f0',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          title: {
            display: true,
            text: '15 Rounds Performance Comparison',
            color: '#60a5fa',
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: 20
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#60a5fa',
            bodyColor: '#e2e8f0',
            borderColor: '#60a5fa',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed.y.toFixed(2) + ' ms';
                return label;
              },
              footer: function(tooltipItems) {
                const roundIndex = tooltipItems[0].dataIndex;
                const seqTime = data.sequentialTimes[roundIndex];
                const threadTime = data.threadedTimes[roundIndex];
                const diff = seqTime - threadTime;
                const improvement = ((diff / seqTime) * 100).toFixed(1);
                return 'Improvement: ' + improvement + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#94a3b8',
              font: {
                size: 12
              },
              callback: function(value) {
                return value.toFixed(1) + ' ms';
              }
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)',
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Execution Time (milliseconds)',
              color: '#60a5fa',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          },
          x: {
            ticks: {
              color: '#e2e8f0',
              font: {
                size: 11
              },
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.05)'
            },
            title: {
              display: true,
              text: 'Game Round',
              color: '#60a5fa',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    });

    console.log('✓ 15-rounds chart displayed');
    console.log('Statistics:', stats);
    
    setTimeout(function() {
      chartSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

  } catch (error) {
    console.error('Error displaying 15-rounds chart:', error);
    showNotification('Error displaying chart', 'error');
  }
}

function hidePerformanceChart() {
  try {
    const chartSection = document.getElementById('chartSection');
    if (chartSection) {
      chartSection.classList.remove('visible');
    }
    
    if (performanceChart) {
      performanceChart.destroy();
      performanceChart = null;
    }
    
    console.log('✓ Performance chart hidden');
  } catch (error) {
    console.error('Error hiding performance chart:', error);
  }
}

// ==================== UI HELPERS ====================

function showLoading() {
  try {
    if (loading) {
      loading.classList.add('visible');
    }
  } catch (error) {
    console.error('Error showing loading:', error);
  }
}

function hideLoading() {
  try {
    if (loading) {
      loading.classList.remove('visible');
    }
  } catch (error) {
    console.error('Error hiding loading:', error);
  }
}

function showNotification(message, type) {
  try {
    if (!notification) {
      console.warn('Notification element not found');
      return;
    }

    let messageElement = notification.querySelector('.toast-message');
    if (!messageElement) {
      messageElement = document.createElement('span');
      messageElement.className = 'toast-message';
      notification.appendChild(messageElement);
    }
    
    messageElement.textContent = message;
    notification.className = 'toast-notification ' + type + ' visible';
    
    console.log('[' + type.toUpperCase() + '] ' + message);
    
    setTimeout(function() {
      notification.classList.remove('visible');
    }, 4000);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

function showWinnerMessage(message) {
  try {
    if (!winnerMessage) {
      console.warn('Winner message element not found');
      return;
    }

    let textElement = winnerMessage.querySelector('.success-text');
    if (!textElement) {
      textElement = document.createElement('p');
      textElement.className = 'success-text';
      winnerMessage.appendChild(textElement);
    }
    
    textElement.textContent = message;
    winnerMessage.classList.add('visible');
    
    setTimeout(function() {
      hideWinnerMessage();
    }, 5000);
  } catch (error) {
    console.error('Error showing winner message:', error);
  }
}

function hideWinnerMessage() {
  try {
    if (winnerMessage) {
      winnerMessage.classList.remove('visible');
    }
  } catch (error) {
    console.error('Error hiding winner message:', error);
  }
}

// ==================== EVENT HANDLERS ====================

function handleResetClick() {
  try {
    resetBoard();
    showNotification('Board reset successfully', 'success');
  } catch (error) {
    console.error('Error handling reset click:', error);
    showNotification('Error resetting board', 'error');
  }
}

function handleComputeClick() {
  try {
    computeAllSolutions();
  } catch (error) {
    console.error('Error handling compute click:', error);
    showNotification('Error computing solutions', 'error');
  }
}

function handleCompareClick() {
  try {
    comparePerformance();
  } catch (error) {
    console.error('Error handling compare click:', error);
    showNotification('Error comparing performance', 'error');
  }
}

// ==================== UTILITY FUNCTIONS ====================

function debugBoardState() {
  console.log('=== Board State ===');
  console.log('Queens placed:', queens.length);
  console.log('Queen positions:', queens);
  
  const board = [];
  for (let i = 0; i < 8; i++) {
    board[i] = [];
    for (let j = 0; j < 8; j++) {
      board[i][j] = '. ';
    }
  }
  
  queens.forEach(function(queen) {
    const row = queen[0];
    const col = queen[1];
    board[row][col] = '♕';
  });
  
  console.log('\nBoard:');
  for (let i = 0; i < 8; i++) {
    console.log(i + ': ' + board[i].join(' '));
  }
  console.log('==================');
}

// ==================== EXPORTS FOR TESTING ====================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isThreatened: isThreatened,
    placeQueen: placeQueen,
    resetBoard: resetBoard,
    showThreatenedCells: showThreatenedCells
  };
}

if (typeof window !== 'undefined') {
  window.debugBoardState = debugBoardState;
  window.resetBoard = resetBoard;
  console.log('✓ Debug functions available: window.debugBoardState(), window.resetBoard()');
}

console.log('✓ eight-queens.js loaded successfully with 15-round testing support');