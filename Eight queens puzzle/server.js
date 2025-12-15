const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Worker } = require('worker_threads');

const app = express();
const port = 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'para2243047',
  database: 'eight_queen'
};

// Database connection pool
const pool = mysql. createPool(dbConfig);

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('✗ Database connection failed:', error. message);
    process.exit(1);
  }
}

/**
 * Sequential algorithm to find all 8-queens solutions
 */
function solveNQueensSequential() {
  const solutions = [];
  const board = Array(8).fill(-1);

  function isSafe(row, col) {
    for (let i = 0; i < row; i++) {
      if (board[i] === col || 
          Math.abs(board[i] - col) === Math.abs(i - row)) {
        return false;
      }
    }
    return true;
  }

  function solve(row) {
    if (row === 8) {
      const solution = [];
      for (let i = 0; i < 8; i++) {
        solution. push([i, board[i]]);
      }
      solutions.push(solution);
      return;
    }

    for (let col = 0; col < 8; col++) {
      if (isSafe(row, col)) {
        board[row] = col;
        solve(row + 1);
        board[row] = -1;
      }
    }
  }

  const startTime = Date.now();
  solve(0);
  const endTime = Date.now();

  return {
    solutions,
    time: endTime - startTime,
    count: solutions.length
  };
}

/**
 * Threaded algorithm to find all 8-queens solutions
 */
function solveNQueensThreaded() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const worker = new Worker(`
      const { parentPort } = require('worker_threads');
      
      function solveNQueens() {
        const solutions = [];
        const board = Array(8).fill(-1);

        function isSafe(row, col) {
          for (let i = 0; i < row; i++) {
            if (board[i] === col || 
                Math.abs(board[i] - col) === Math.abs(i - row)) {
              return false;
            }
          }
          return true;
        }

        function solve(row) {
          if (row === 8) {
            const solution = [];
            for (let i = 0; i < 8; i++) {
              solution. push([i, board[i]]);
            }
            solutions. push(solution);
            return;
          }

          for (let col = 0; col < 8; col++) {
            if (isSafe(row, col)) {
              board[row] = col;
              solve(row + 1);
              board[row] = -1;
            }
          }
        }

        solve(0);
        return solutions;
      }

      const result = solveNQueens();
      parentPort.postMessage(result);
    `, { eval: true });

    worker.on('message', (solutions) => {
      const endTime = Date.now();
      resolve({
        solutions,
        time: endTime - startTime,
        count: solutions.length
      });
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

/**
 * Endpoint:  Compute all solutions (both sequential and threaded)
 */
app.post('/compute-solutions', async (req, res) => {
  try {
    console.log('Computing solutions using sequential algorithm...');
    const sequentialResult = solveNQueensSequential();
    console.log(`Sequential:  Found ${sequentialResult.count} solutions in ${sequentialResult.time}ms`);

    console.log('Computing solutions using threaded algorithm...');
    const threadedResult = await solveNQueensThreaded();
    console.log(`Threaded: Found ${threadedResult. count} solutions in ${threadedResult.time}ms`);

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      await connection.query('DELETE FROM algorithm_solutions');
      await connection. query('DELETE FROM algorithm_performance');

      for (const solution of sequentialResult. solutions) {
        const serialized = JSON.stringify(solution);
        await connection.query(
          'INSERT INTO algorithm_solutions (queen_positions) VALUES (?)',
          [serialized]
        );
      }

      await connection.query(
        'INSERT INTO algorithm_performance (algorithm_type, execution_time_ms, solutions_count) VALUES (?, ?, ?)',
        ['sequential', sequentialResult.time, sequentialResult.count]
      );

      await connection.query(
        'INSERT INTO algorithm_performance (algorithm_type, execution_time_ms, solutions_count) VALUES (?, ?, ?)',
        ['threaded', threadedResult.time, threadedResult.count]
      );

      await connection.commit();

      res.status(200).json({
        message: 'Solutions computed and saved successfully',
        solutionsCount: sequentialResult.count,
        sequential: {
          time: sequentialResult. time,
          count: sequentialResult.count
        },
        threaded: {
          time:  threadedResult.time,
          count: threadedResult.count
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error computing solutions:', error);
    res.status(500).json({
      message: 'Error computing solutions',
      error: error.message
    });
  }
});

/**
 * Endpoint: Run 15 rounds of performance testing
 */
app.post('/run-15-rounds', async (req, res) => {
  try {
    console.log('Starting 15-round performance test...');
    
    const sequentialTimes = [];
    const threadedTimes = [];
    
    // Run 15 rounds
    for (let round = 1; round <= 15; round++) {
      console.log(`Running round ${round}/15... `);
      
      // Sequential test
      const sequentialResult = solveNQueensSequential();
      sequentialTimes.push(sequentialResult.time);
      
      // Threaded test
      const threadedResult = await solveNQueensThreaded();
      threadedTimes.push(threadedResult.time);
      
      console.log(`Round ${round}:  Sequential=${sequentialResult.time}ms, Threaded=${threadedResult.time}ms`);
    }
    
    // Calculate statistics
    const avgSequential = sequentialTimes. reduce((a, b) => a + b, 0) / 15;
    const avgThreaded = threadedTimes.reduce((a, b) => a + b, 0) / 15;
    const minSequential = Math.min(...sequentialTimes);
    const maxSequential = Math.max(...sequentialTimes);
    const minThreaded = Math.min(...threadedTimes);
    const maxThreaded = Math.max(...threadedTimes);
    
    // Store in database
    const connection = await pool.getConnection();
    
    try {
      await connection. beginTransaction();
      
      // Clear previous round data
      await connection.query('DELETE FROM performance_rounds');
      
      // Insert all 15 rounds
      for (let i = 0; i < 15; i++) {
        await connection.query(
          'INSERT INTO performance_rounds (round_number, sequential_time, threaded_time) VALUES (?, ?, ?)',
          [i + 1, sequentialTimes[i], threadedTimes[i]]
        );
      }
      
      await connection.commit();
      
      res.status(200).json({
        message: '15-round performance test completed',
        sequentialTimes: sequentialTimes,
        threadedTimes: threadedTimes,
        statistics:  {
          sequential: {
            average: avgSequential,
            min: minSequential,
            max: maxSequential
          },
          threaded: {
            average: avgThreaded,
            min: minThreaded,
            max: maxThreaded
          },
          speedup: (avgSequential / avgThreaded).toFixed(2)
        }
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error in 15-round test:', error);
    res.status(500).json({
      message: 'Error running 15-round test',
      error: error.message
    });
  }
});

/**
 * Endpoint: Get 15 rounds data
 */
app.get('/get-15-rounds', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rounds] = await connection.query(
      'SELECT round_number, sequential_time, threaded_time FROM performance_rounds ORDER BY round_number'
    );
    
    connection.release();
    
    if (rounds.length === 0) {
      return res.status(404).json({
        message: 'No round data found.  Please run 15-round test first.'
      });
    }
    
    res.status(200).json({
      rounds: rounds,
      totalRounds: rounds.length
    });
    
  } catch (error) {
    console.error('Error getting 15 rounds:', error);
    res.status(500).json({
      message: 'Error retrieving round data',
      error: error. message
    });
  }
});

/**
 * Endpoint: Compare performance
 */
app.get('/compare-performance', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [metrics] = await connection.query(
      'SELECT algorithm_type, execution_time_ms, solutions_count FROM algorithm_performance ORDER BY id DESC LIMIT 2'
    );

    connection.release();

    if (metrics.length < 2) {
      return res.status(404).json({
        message: 'Performance metrics not found. Please compute solutions first.'
      });
    }

    const sequential = metrics. find(m => m.algorithm_type === 'sequential');
    const threaded = metrics.find(m => m.algorithm_type === 'threaded');

    res.status(200).json({
      sequentialTime: sequential.execution_time_ms,
      threadedTime: threaded.execution_time_ms,
      speedup: (sequential.execution_time_ms / threaded.execution_time_ms).toFixed(2),
      solutionsCount: sequential.solutions_count
    });

  } catch (error) {
    console.error('Error comparing performance:', error);
    res.status(500).json({
      message: 'Error comparing performance',
      error: error. message
    });
  }
});

/**
 * Endpoint: Submit player solution
 */
app.post('/submit-solution', async (req, res) => {
  try {
    const { username, queenPositions } = req.body;

    if (!username || !queenPositions) {
      return res.status(400).json({
        message: 'Username and queen positions are required'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        message: 'Username must be at least 3 characters long'
      });
    }

    if (! Array.isArray(queenPositions) || queenPositions.length !== 8) {
      return res.status(400).json({
        message: 'Invalid solution:  Must have exactly 8 queens'
      });
    }

    const serializedPositions = JSON.stringify(queenPositions);
    const connection = await pool.getConnection();

    try {
      await connection. beginTransaction();

      let [users] = await connection.query(
        'SELECT user_id FROM users WHERE username = ?  LIMIT 1',
        [username]
      );

      let userId;
      if (! users || users.length === 0) {
        const [result] = await connection.query(
          'INSERT INTO users (username) VALUES (?)',
          [username]
        );
        userId = result.insertId;
      } else {
        userId = users[0].user_id;
      }

      const [validSolutions] = await connection.query(
        'SELECT id FROM algorithm_solutions WHERE queen_positions = ? LIMIT 1',
        [serializedPositions]
      );

      if (!validSolutions || validSolutions. length === 0) {
        await connection.rollback();
        connection.release();
        return res. status(400).json({
          message: 'Invalid solution!  This is not a correct answer to the 8-queens puzzle.'
        });
      }

      const [playerSolutions] = await connection.query(
        'SELECT game_id FROM player_solutions WHERE queen_positions = ? LIMIT 1',
        [serializedPositions]
      );

      if (playerSolutions && playerSolutions.length > 0) {
        await connection.rollback();
        connection.release();
        return res. status(409).json({
          message: 'This solution has already been found by another player.  Try a different solution!'
        });
      }

      const [countResult] = await connection.query(
        'SELECT COUNT(*) AS foundCount FROM player_solutions'
      );

      const foundCount = countResult[0].foundCount;

      if (foundCount >= 92) {
        await connection.query('DELETE FROM player_solutions');
        await connection.query('DELETE FROM games');
        
        await connection.commit();
        connection. release();
        
        return res.status(200).json({
          message: '🎉 Congratulations! All 92 solutions have been discovered!  The game has been reset for new players.'
        });
      }

      await connection.query(
        'INSERT INTO player_solutions (user_id, queen_positions) VALUES (?, ?)',
        [userId, serializedPositions]
      );

      await connection.query(
        'INSERT INTO games (user_id, queen_positions) VALUES (?, ?)',
        [userId, serializedPositions]
      );

      await connection.commit();
      connection.release();

      const remaining = 92 - foundCount - 1;
      res.status(200).json({
        message: `✓ Correct solution! You've found solution #${foundCount + 1}.  ${remaining} more to go!`
      });

    } catch (error) {
      await connection. rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({
      message: 'Error submitting solution',
      error: error. message
    });
  }
});

/**
 * Endpoint: Get solutions count
 */
app.get('/solutions-count', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'SELECT COUNT(*) AS count FROM player_solutions'
    );

    connection.release();

    res.status(200).json({
      count: result[0].count,
      total: 92
    });

  } catch (error) {
    console.error('Error getting solutions count:', error);
    res.status(500).json({
      message: 'Error getting solutions count',
      error: error.message
    });
  }
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

/**
 * Start server
 */
app.listen(port, async () => {
  await testConnection();
  console.log(`✓ Server running on http://localhost:${port}`);
  console.log('✓ Ready to accept requests');
});

module.exports = app;