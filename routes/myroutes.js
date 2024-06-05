const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

function getnewCaptcha(){
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i <=6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

router.get("/", (req,res)=>{
    res.render("index");
});

router.get("/login", (req,res)=>{
    res.render("login",{captcha: cap=getnewCaptcha()});
});

router.get("/register", (req,res)=>{
    res.render("register",{captcha: cap=getnewCaptcha()});
});

router.get('/account', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        const user = req.user;
        res.render("account",{user});
    } else {
        res.render("login",{captcha: cap=getnewCaptcha()});
    }
});

module.exports = router;