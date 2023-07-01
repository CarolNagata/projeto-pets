const jwt = require('jsonwebtoken')

const createUserToken = async (user, req, res) => {

    //create a token
    const token = jwt.sign({
        neme: user.name,
        id: user._id
    }, "secret")

    //return token
    res.status(200).json({
        message: 'Atenticado com sucesso',
        token: token,
        userId: user._id
    })
}

module.exports = createUserToken