const mysql = require('mysql');
const jwt = require("jsonwebtoken");

function getnewCaptcha(){
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i <=6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const db = mysql.createConnection({
    host: process.env.database_host,
    user: process.env.database_user,
    password: process.env.database_password,
    database: process.env.database
})

exports.register = (req,res)=>{
    console.log(req.body);
    var {name, email, password, parola, captcha, Scaptcha} = req.body;

    if(!name || !email || !parola){
        return res.render('register',{message: 'Fill out the form', captcha: cap= getnewCaptcha()});
    }

    if(captcha !== Scaptcha){
        return res.render('register',{message: 'CAPTCHA is wrong', captcha: cap= getnewCaptcha()});
    }

    db.query('SELECT Usermail FROM userinfo WHERE Usermail = ?', [email], (error,result)=>{
        const user = result[0];
        if (error) console.log(error); 
        if (result.length>0){
            console.log("email in use");
            return res.render('register',{message: 'Email is already in use.', captcha: cap = getnewCaptcha()});
        } else if (password !== parola){
            return res.render('register',{message: 'Passwords do not match.', captcha: cap = getnewCaptcha()});
        } 

        db.query('INSERT INTO userinfo SET ?', { Username: name, Userpass: password , Usermail: email}, (error, results)=>{
            if (error) console.log(error); else {
                return res.render('account',{user});
            }
        });
    });
    
}

exports.login = (req,res)=>{
    var {email, password, captcha, Scaptcha} = req.body;
    console.log(req.body);

    if(!email || !password){
        return res.render('login',{message: 'Fill out the form', captcha: cap= getnewCaptcha()});
    }

    if(captcha !== Scaptcha){
        return res.render('login',{message: 'CAPTCHA is wrong', captcha: cap= getnewCaptcha()});
    }

    db.query('SELECT * FROM userinfo WHERE Usermail = ?', [email], (error,result)=>{
        if (error) console.log(error); 

        if (!result){
            console.log("email not found");
            return res.render('login',{message: 'Wrong email or password', captcha: cap = getnewCaptcha()});
        } 
        if (result[0].Userpass !== password){
            console.log("wrong password");
            res.render('login',{message: 'Wrong email or password', captcha: cap = getnewCaptcha()});
        }

        if (result[0].Userpass === password){
            const id = result[0].ID;

            const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            const user = result[0];
            console.log("the token is " + token);

            const cookieOptions = {
                httpOnly: true
            }
            res.cookie('userSave', token, cookieOptions);
            return res.render('account',{user});
        }

    });
}

exports.isLoggedIn = async (req, res, next) => {
    console.log("checking if user is logged in.")
    if (req.cookies.userSave) {
        try {
            const decoded = jwt.verify(req.cookies.userSave,
                process.env.JWT_SECRET
            );
            console.log(decoded);

            db.query('SELECT * FROM userinfo WHERE ID = ?', [decoded.id], (err, result) => {
                console.log(result);
                if (!result) {
                    return next();
                }
                req.user = result[0];
                return next();
            });
        } catch (error) {
            console.log(error)
            return next();
        }
    } else {
        next();
    }
}

exports.logout = (req, res) => {
    res.cookie('userSave', 'logout', {
        httpOnly: true
    });
    res.render('login',{captcha: cap = getnewCaptcha()});
}

exports.changeName = (req,res)=>{
    var {email,newname, password} = req.body;
    console.log(req.body);

    if (!email || !newname || !password){
        res.render('account',{message2: 'Fill out the form'});
    }

    db.query('SELECT * FROM userinfo WHERE Usermail = ?', [email], (error,result)=>{
        const user = result[0];
        if (error) console.log(error);
        if (!result){
            console.log("email not found");
            return res.render('account',{user , message: 'Wrong email'});
        } else if (result[0].Userpass !== password){
            console.log("wrong password");
            return res.render('account',{user , message: 'Wrong password'});
        }
        db.query('UPDATE userinfo SET Username = ? WHERE Usermail = ?', [newname,email], (error,result)=>{
            if (error){
                console.log(error);
            } 
            res.render('account',{user , message: 'Name changed'});
        })
    });
}


exports.changePassword = (req,res)=>{
    var {email, oldpass, newpass} = req.body;
    console.log(req.body);
    if (!email || !oldpass || !newpass){
        res.render('account',{message2: 'Fill out the form'});
    }
    db.query('SELECT * FROM userinfo WHERE Usermail = ?', [email], (error,result)=>{
        const user = result[0];
        if (error) {
            console.log(error);
        }
        if (!result){
            res.render('account',{user , message2: 'Error fetching user'});
        } else if (newpass==oldpass){
            res.render('account',{user , message2: 'Passwords cannot match'});
        } else if (result[0].Userpass !== oldpass){
            res.render('account',{user , message2: 'Wrong password'});
        }
        db.query('UPDATE userinfo SET Userpass = ? WHERE Usermail = ?', [newpass,email], (error,result)=>{
            if (error){
                console.log(error);
            } 
            res.render('account',{user , message2: 'Password changed'});
        })
    });
}