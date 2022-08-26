const handleProfileGet = (req, res, knex) => {
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

}

module.exports = {
    handleProfileGet: handleProfileGet
}