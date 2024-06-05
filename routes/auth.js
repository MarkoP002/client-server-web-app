const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.database_host,
    user: process.env.database_user,
    password: process.env.database_password,
    database: process.env.database
});

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get('/logout', authController.logout);

router.post("/changeName", authController.changeName);

router.post("/changePassword", authController.changePassword);
module.exports = router;