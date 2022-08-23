const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '987',
            hash: '',
            email: 'john@gmail.com'
        }
    ]
}


// these are request and response objects
// don't forget that this is the server and therefore postman is the client
// we are sending information to the client
app.get('/', (req, res) => {
    res.send(database.users);
});

// Without a database changes are lost when nodemon has to reload

app.post('/signin', (req, res) => {
    // to use req.body we need to use body-parser
    // check the email and password against the database
    if(req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json("error logging in");
    }
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            found = true;
            return res.json(user);
        }
    } )
    if(!found) {
        res.status(400).json("not found");
    }
})

app.post('/register', (req, res) => {
    const {email, name, password} = req.body;

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, (err, hash)=>{
            console.log(hash);
        })
    })

    database.users.push({
        id: '125',
        name: name,
        email: email,
        entries: 0,
        joined: new Date()
    })
    // If no response is sent the server will remain and saying loggin
    res.json(database.users[database.users.length - 1]);
});

app.put('/image', (req, res) => {
    const {id} = req.body;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    } )
    if(!found) {
        res.status(400).json("not found");
    }
})

// this also tells us the port that our server is listening on
app.listen(4000, () => {
    console.log("I am listening on port 4000");
});

/*

/ --> Responds with this is working
/signin --> POST request with email and password (will respond with success or failure) (retunr the new created user below)
/register --> POST request with email, password, name (will respond with success or failure)
/profile/:userId --> GET request (return the user)
/image --> PUT --> updated user object / count

*/
