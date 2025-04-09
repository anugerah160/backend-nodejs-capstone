const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        //Step 2: task 1 - insert code here
        const db = await connectToDatabase();
        //Step 2: task 2 - insert code here
        const collection = db.collection("secondChanceItems");
        //Step 2: task 3 - insert code here
        const secondChanceItems = await collection.find({}).toArray();
        //Step 2: task 4 - insert code here
        res.json(secondChanceItems);

    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('file'), async(req, res, next) => {
    try {
        // Task 1: Connect to DB
        const db = await connectToDatabase();

        // Task 2: Get the collection
        const collection = db.collection("secondChanceItems");

        // Task 3: Get request body
        let secondChanceItem = req.body;

        // Task 4: Get last ID
        const lastItemArr = await collection.find().sort({ id: -1 }).limit(1).toArray();
        const lastId = lastItemArr.length > 0 ? parseInt(lastItemArr[0].id) : 0;
        secondChanceItem.id = (lastId + 1).toString();

        // Task 5: Add current date (in ISO format)
        secondChanceItem.date_added = new Date();

        // Task 7: Add image URL if available
        if (req.file) {
            secondChanceItem.imageUrl = `/images/${req.file.originalname}`;
        }

        // Task 6: Insert to DB
        const result = await collection.insertOne(secondChanceItem);

        res.status(201).json(result.ops[0]); // or result.insertedId if needed
    } catch (e) {
        next(e);
    }
});


// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        //Step 4: task 1 - insert code here
        //Step 4: task 2 - insert code here
        //Step 4: task 3 - insert code here
        //Step 4: task 4 - insert code here
    } catch (e) {
        next(e);
    }
});

// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        //Step 5: task 1 - insert code here
        //Step 5: task 2 - insert code here
        //Step 5: task 3 - insert code here
        //Step 5: task 4 - insert code here
        //Step 5: task 5 - insert code here
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    try {
        //Step 6: task 1 - insert code here
        //Step 6: task 2 - insert code here
        //Step 6: task 3 - insert code here
        //Step 6: task 4 - insert code here
    } catch (e) {
        next(e);
    }
});

module.exports = router;
