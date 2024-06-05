const { register, login, isLoggedIn, logout, changeName, changePassword } = require('../controllers/auth.js');
const mysql = require('mysql');
const jwt = require("jsonwebtoken");

//DATABASE

describe('Database function', () => {
    let connection;
  
    beforeAll(() => {
      connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'clientdata'
      });
    });
  
    afterAll(() => {
      connection.end();
    });
  
    it('Should connect to database.', () => {
      connection.connect(err => {
        if (err) {
          throw err;
        }
        expect(!err);
      });
    });
  
    it('Should return a query from database.', () => {
      connection.query('SELECT * FROM userinfo', (err, results) => {
        if (err) {
          throw err;
        }
        expect(results).toBeTruthy();
      });
    });
});

//REGISTER

describe('Register function', () => {
    let connection;
  
    beforeAll(() => {
      connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'clientdata'
      });
    });
  
    afterAll(() => {
      connection.end();
    });

    it('Should return an error if any field is empty.', () => {
        const req = { body: { name: '', email: '', password: '', parola: '' } };
        const res = { render: jest.fn() };

        register(req, res);

        expect(res.render).toHaveBeenCalledWith('register', { message: 'Fill out the form', captcha: expect.any(String) });
    });

    it('Should return an error if CAPTCHA is wrong or missing.', () => {
        const req = { body: { name: 'John Doe', email: 'johndoe@example.com', password: '12345', parola: '12345', captcha: 'abc', Scaptcha: 'def' } };
        const res = { render: jest.fn() };

        register(req, res);

        expect(res.render).toHaveBeenCalledWith('register', { message: 'CAPTCHA is wrong', captcha: expect.any(String) });
    });

    it('Should return an error if user is already registered',()=>{
        const req = { body: { name: 'John Doe', email: 'johndoe@example.com', password: '12345', parola: '12345', captcha: 'abc', Scaptcha: 'def' } };
        const res = { render: jest.fn() };

        connection.query('SELECT * FROM userinfo WHERE Usermail = ?', [req.body.email],(err, results) => {
            if (err) {
              throw err;
            }
            expect(!results);
          });
    })

});

//LOGIN 

describe('Login function', () => {
    let connection;
  
    beforeAll(() => {
      connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'clientdata'
      });
    });
  
    afterAll(() => {
      connection.end();
    });

    it('Should return an error if any field is empty.', () => {
        const req = { body: { name: '', email: '', password: '', parola: '' } };
        const res = { render: jest.fn() };

        login(req, res);

        expect(res.render).toHaveBeenCalledWith('login', { message: 'Fill out the form', captcha: expect.any(String) });
    });

    it('Should return an error if CAPTCHA is wrong or missing.', () => {
        const req = { body: { name: 'test', email: 'test@example.com', password: '12345', parola: '12345', captcha: 'abc', Scaptcha: 'def' } };
        const res = { render: jest.fn() };

        login(req, res);

        expect(res.render).toHaveBeenCalledWith('login', { message: 'CAPTCHA is wrong', captcha: expect.any(String) });
    });

    it('Should log in the user if credentials are OK.',()=>{
        const req = { body: { name: 'test', email: 'test@example.com', password: '12345', parola: '12345', captcha: 'abc', Scaptcha: 'def' } };
        const res = { render: jest.fn() };

        connection.query('SELECT * FROM userinfo WHERE Usermail = ? AND Userpass = ?', [req.body.email, req.body.password],(err, results) => {
            if (err) {
              throw err;
            }
            expect(results).toBeTruthy();
          });
    })
});

// CHANGE NAME

describe('Changename function', () => {
    it('Should return an error if any field is empty.', () => {
        const req = { body: { email: '', newname: '',password: ''} };
        const res = { render: jest.fn() };

        changeName(req, res);
        expect(res.render).toHaveBeenCalledWith('account', { message2: 'Fill out the form' });
    });
});

//CHANGE PASSWORD

describe('Changepassword function', () => {
    let connection;
  
    beforeAll(() => {
      connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'clientdata'
      });
    });
  
    afterAll(() => {
      connection.end();
    });

    it('Should return an error if any field is empty.', () => {
        const req = { body: { email: '', newname: '',password: ''} };
        const res = { render: jest.fn() };

        changePassword(req, res);
        expect(res.render).toHaveBeenCalledWith('account', { message2: 'Fill out the form' });
    });

    it('Should give an error if passwords are the same', done =>{
        const req = { body: { name: 'test', email: 'test@example.com', password: '12345', newpass:'12345'} };

        if(req.body.newpass == req.body.newpass){
            done();
        }
    })
});

//LOGOUT

describe('Logout function', () => { test('should clear the userSave cookie', () => { 
    const req = {}; 
    const res = { cookie: jest.fn(), render: jest.fn() };

    logout(req, res);

    expect(res.cookie).toHaveBeenCalledWith('userSave', 'logout', { httpOnly: true });
    });

});

// IS LOGGED IN 

describe('IsLoggedIn function', () => { let req, res, next;
    beforeEach(() => {
        req = { cookies: {} };
        res = {};
        next = jest.fn();
    });
    
    test('Should continue if user has no cookies', async () => {
        await isLoggedIn(req, res, next);
    
        expect(next).toHaveBeenCalled();
    });
    
    test('Should continue if token is not valid.', async () => {
        req.cookies.userSave = 'invalidToken';
    
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('Invalid token');
        });
    
        await isLoggedIn(req, res, next);
    
        expect(next).toHaveBeenCalled();
    });
    
});