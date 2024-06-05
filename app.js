const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require("cookie-parser");

const app = express();

dotenv.config({path:'./.env'});
app.set('view engine', 'hbs');
const publicDirectory = path.join(__dirname, './public' );
app.use(express.static(publicDirectory));
app.use(cookieParser());
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.database_host,
    user: process.env.database_user,
    password: process.env.database_password,
    database: process.env.database
})

db.connect((error)=>{
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL connected");
    }
})

app.use('/', require('./routes/myroutes'));
app.use('/auth', require('./routes/auth'));

app.listen(5000,()=>{
    console.log("server started on port 5000");
})