const handleSignin = (req, res, knex, bcrypt) => {
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
}

module.exports = {
    handleSignin: handleSignin
}