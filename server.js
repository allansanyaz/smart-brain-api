const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
// the set up of the database here
const knex = require('knex')({
    client: 'pg',
    connection: {
      host : 'localhost',
      port : 5432,
      user : 'db-user',
      password : '',
      database : 'smart-brain'
    }
  });
  

const app = express();
app.use(bodyParser.json());
app.use(cors());

// these are request and response objects
// don't forget that this is the server and therefore postman is the client
// we are sending information to the client
app.get('/', (req, res) => {
    res.send("Success")
});

// Without a database changes are lost when nodemon has to reload

app.post('/signin', (req, res) => {
    // to use req.body we need to use body-parser
    // check the email and password against the database
    knex.select('email', 'hash').from('login').where('email', '=', req.body.email)
    .then(data => {
        bcrypt.compare(req.body.password, data[0].hash).then(result => {
            if(result) {
                return knex.select('*').from('users').where('email', '=', req.body.email)
                .then(user => {
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('Unable to get user'))
            } else {
                res.status(400).json('Wrong credentials')
            }
        })
    })
    .catch(err => res.status(400).json('Wrong user or password combination'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    // if there is nothing it will return an empty array
    knex.select('*').from('users').where('id', id)
    .then(user => {
        if(!(user.length === 0)) {
            res.json(user)
        } else {
            res.status(400).json('Page not found');
        }
    });

})

app.post('/register', (req, res) => {
    const {email, name, password} = req.body;

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, (err, hash)=>{
            knex.transaction(trx => {
                trx.insert({
                    hash: hash,
                    email: email
                })
                .into('login')
                .returning('email')
                .then(loginEmail => {
                    return trx('users')
                    .returning('*')
                    .insert({
                        name: name,
                        email: loginEmail[0].email,
                        joined: new Date(),
                    })
                    .then(user => {
                        res.json(user[0]);
                    })
                })
                .then(trx.commit)
                .catch(trx.rollback);
            })
            .catch(err => res.status(400).json('unable to register'))
        })
    })
    
})

app.put('/image', (req, res) => {
    const {id} = req.body;
    
    knex('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to update entries'));
})

// this also tells us the port that our server is listening on
app.listen(3001, () => {
    console.log("I am listening on port 3001");
});

