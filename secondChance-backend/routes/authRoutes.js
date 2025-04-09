const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const bcrypt = require('bcryptjs/dist/bcrypt');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        // Task 1 & 2: Connect to database and access users collection
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const { email, password, firstName, lastName } = req.body;

        // Validate required fields
        if (!email || !password) {
            logger.error('Email or password is missing');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Task 3: Check if email already exists
        const existingEmail = await collection.findOne({ email });
        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        // Task 4: Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Task 5: Insert new user into the database
        const result = await collection.insertOne({
            email,
            firstName,
            lastName,
            password: hashedPassword,
            createdAt: new Date(),
        });

        // Task 6: Create JWT token with user ID as payload
        const payload = {
            user: {
                id: result.insertedId,
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        // Task 7: Log successful registration
        logger.info(`User registered successfully: ${email}`);

        // Task 8: Return email and token
        res.status(201).json({ email, authtoken });

    } catch (e) {
        logger.error(`Registration error: ${e.message}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {

        //validation
        const {email, password} = req.body;
        if (!email || !password) {
            logger.error('Email or password not provided');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();
        // Task 2: Access MongoDB `users` collection
        const collection = db.collection('users')
        // Task 3: Check for user credentials in database
        const user = await collection.findOne({email});
        if(!user){
            logger.warn('user not found');
            return res.status(401).json({error: "Invalid Credentials"});
        }

        // Task 4: Check if the password matches the encrypted password and send appropriate message on mismatch
        const isMatch = await bcrypt.compare(password, user.password);
        // Task 7: Send appropriate message if the user is not found
        if(!isMatch){
            logger.warn('Password Mismatch');
            return res.status(401).json({error: "Invalid Credentials"});
        }

        // Task 6: Create JWT authentication if passwords match with user._id as payload
        const payload = {
            user: {
                id: user._id.toString(),
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        // Task 5: Fetch user details from a database
        const userName = `${user.firstName}`;
        const userEmail = `${user.email}`;

        logger.info(`User logged in: ${userEmail}`);

        res.json({authtoken, userName, userEmail });
    } catch (e) {
         return res.status(500).send('Internal server error');
    }
});

module.exports = router;
