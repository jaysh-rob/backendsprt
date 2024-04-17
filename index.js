const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors')


const app = express();
app.use(cors())
const port = 3000;

// MySQL Connection
const connection = mysql.createConnection({
  host: '54.74.133.238',
  user: 'jayuser',
  password: 'Jay@4321',
  database: 'sports_db'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);

});

// Middleware
app.use(bodyParser.json());

// Swagger Options
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Sports API',
      description: 'API to manage sports data',
      version: '1.0.0'
    },
  },
  apis: ['./index.js'], // Assuming this file is named index.js
};

// Initialize Swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * tags:
 *   name: Sports
 *   description: API endpoints for managing sports data
 */

/**
 * @swagger
 * /sports:
 *   get:
 *     summary: Get all sports data
 *     description: Retrieve all sports data from the database
 *     tags: [Sports]
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /sports/{sport}:
 *   get:
 *     summary: Get data for a specific sport
 *     description: Retrieve data for a specific sport from the database
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: sport
 *         required: true
 *         description: The name of the sport
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Sport not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update sport data
 *     description: Update data for a specific sport in the database
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: sport
 *         required: true
 *         description: The name of the sport
 *         schema:
 *           type: string
 *       - in: body
 *         name: sportData
 *         description: The sport data to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             recommended_foods:
 *               type: array
 *               items:
 *                 type: string
 *             avoid_foods:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Sport not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete sport data
 *     description: Delete data for a specific sport from the database
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: sport
 *         required: true
 *         description: The name of the sport
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Sport not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /sports:
 *   post:
 *     summary: Create new sport data
 *     description: Create new sport data and add it to the database
 *     tags: [Sports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sport:
 *                 type: string
 *               recommended_foods:
 *                 type: array
 *                 items:
 *                   type: string
 *               avoid_foods:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Internal server error
 */


// Routes

// Get all sports data
app.get('/sports', (req, res) => {
  connection.query('SELECT * FROM sports', (error, results, fields) => {
    if (error) {
      console.error('Error retrieving sports data: ' + error.message);
      res.status(500).send('Error retrieving sports data');
      return;
    }
    // Parse JSON strings into proper JSON arrays
    results.forEach(result => {
      result.recommended_foods = JSON.parse(result.recommended_foods);
      result.avoid_foods = JSON.parse(result.avoid_foods);
    });

    res.json(results);
  });
});

// Get data for a specific sport
app.get('/sports/:sport', (req, res) => {
  const sport = req.params.sport;
  connection.query('SELECT * FROM sports WHERE sport = ?', [sport], (error, results, fields) => {
    if (error) {
      console.error('Error retrieving sport data: ' + error.message);
      res.status(500).send('Error retrieving sport data');
      return;
    }
    if (results.length === 0) {
      res.status(404).send({success:false,message:'Sport not found'});
    } else {
      // Parse JSON strings into proper JSON arrays
      results.forEach(result => {
        result.recommended_foods = JSON.parse(result.recommended_foods);
        result.avoid_foods = JSON.parse(result.avoid_foods);
      });
      res.json(results[0]);
    }
  });
});

// Create new sport data
app.post('/sports', (req, res) => {
  const { sport, recommended_foods, avoid_foods } = req.body;
  connection.query('INSERT INTO sports (sport, recommended_foods, avoid_foods) VALUES (?, ?, ?)', [sport, JSON.stringify(recommended_foods), JSON.stringify(avoid_foods)], (error, results, fields) => {
    if (error) {
      // console.error('Error creating sport data: ' + error?.sqlMessage);
      res.status(500).send({ success: false, message: error?.sqlMessage });
      return;
    }
    res.send({ success: true, message: 'Sport data created successfully' });
  });
});

// Update sport data
app.put('/sports/:sport', (req, res) => {
  const sport = req.params.sport;
  const { recommended_foods, avoid_foods } = req.body;
  connection.query('UPDATE sports SET recommended_foods = ?, avoid_foods = ? WHERE sport = ?', [JSON.stringify(recommended_foods), JSON.stringify(avoid_foods), sport], (error, results, fields) => {
    if (error) {
      console.error('Error updating sport data: ' + error.message);
      res.status(500).send('Error updating sport data');
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).send({success:false,message:'Sport not found'});
    } else {
      res.send({success:true,message:'Sport data updated successfully'});
    }
  });
});

// Delete sport data
app.delete('/sports/:sport', (req, res) => {
  const sport = req.params.sport;
  connection.query('DELETE FROM sports WHERE sport = ?', [sport], (error, results, fields) => {
    if (error) {
      console.error('Error deleting sport data: ' + error.message);
      res.status(500).send('Error deleting sport data');
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).send({success:false,message:'Sport not found'});
    } else {
      res.send({success:true,message:'Sport data deleted successfully'});
    }
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Validate request parameters
  if (!email || !password) {
    return res.status(400).send({ success: false, message: 'Email and password are required' });
  }

  // Check if user exists in the database
  connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
    if (error) {
      console.error('Error retrieving user data: ' + error.message);
      return res.status(500).send('Error retrieving user data');
    }

    if (results.length === 0) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    // User found, verify password
    const user = results[0];
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error('Error comparing passwords: ' + err.message);
        return res.status(500).send('Error comparing passwords');
      }
      if (!result) {
        return res.status(401).send({ success: false, message: 'Incorrect password' });
      }

      // Passwords match, generate JWT
      const token = jwt.sign({ userId: user.id, email: user.email }, 'secretkey', { expiresIn: '1h' });
      res.send({ success: true, token: token, name:user.name });
    });
  });
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { email, name, contact_num, password } = req.body;
  // Validate request parameters
  if (!email || !name || !contact_num || !password) {
    return res.status(400).send({ success: false, message: 'All fields are required' });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password: ' + err.message);
      return res.status(500).send('Error hashing password');
    }

    // Insert user into database
    connection.query('INSERT INTO users (email, name, contact_num, password) VALUES (?, ?, ?, ?)', [email, name, contact_num, hashedPassword], (error, results, fields) => {
      if (error) {
        console.error('Error creating user: ' + error.message);
        return res.status(500).send({ success: false, message: 'Error creating user'});
      }
      res.send({ success: true, message: 'User created successfully' });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
