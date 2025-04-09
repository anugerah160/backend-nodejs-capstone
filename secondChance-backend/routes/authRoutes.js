const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../logger');

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

module.exports = router;
