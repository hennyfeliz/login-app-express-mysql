const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

// Datos de la conexion a base de datos
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'feferrefe2020',
	database : 'nodelogin'
});

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', (request, response) => {
	// Renderizar plantilla HTML de login
	response.sendFile(path.join(`${__dirname}/login.html`));
});

app.post('/auth', (request, response) => {
	const { username, password } = request.body;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], (error, results, fields) => {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', (request, response) => {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send(`Welcome back, ${request.session.username}!`);
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(3000);