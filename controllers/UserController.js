const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {
    static async register(req, res) {
        const { name, email, phone, password, confirmpassword } = req.body

        // //outro mode de declarar uma variavel 
        // const name = req.body.name
        // const email = req.body.email
        // const phone = req.body.phone
        // const password = req.body.password
        // const confirmpassword = req.body.confirmpassword

        //validation => como esses dados são obrigatorios, eu vou mandar uma msg de erro para o usuario caso algum desses erros tenham vindo da requisição
        //podemos fazer mais validações como se o email tem o @ correto, se o telefone tem x qtd de numeros, se a senha é forte 

        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório' })
            return
        }

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório' })
            return
        }

        //check if users exists
        const userExists = await User.findOne({ email: email })

        if (userExists) {
            res.status(422).json({ message: 'E-mail já cadastrado' })
            return
        }

        if (!phone) {
            res.status(422).json({ message: 'O telefone é obrigatório' })
            return
        }

        if (!password) {
            res.status(422).json({ message: 'A senha é obrigatória' })
            return
        }

        if (!confirmpassword) {
            res.status(422).json({ message: 'A confirmação da senha é obrigatória' })
            return
        }

        if (password !== confirmpassword) {
            res.status(422).json({ message: 'Senhas diferentes' })
        }

        //create a password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        //creste a user
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash
        })

        //salvando o usuário
        try {
            const newUser = await user.save()
            //criando usuário com token
            //await createUserToken(newUser, req, res)
            // //para ver que o usuário foi criado
            res.status(201).json({ message: 'Usuário criado', newUser })
        } catch (err) {
            res.status(500).json({ message: error })
            return
        }
    }
    //criando login
    static async login(req, res) {
        const { email, password } = req.body

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório' })
            return
        }

        // //check if email has alredy taken
        // const userExists = await User.findOne({ email: email })

        // if (!user.email !== email && userExists) {
        //     res.status(422).json({ message: 'E-mail já cadastrado', })
        //     return
        // }

        if (!password) {
            res.status(422).json({ message: 'A senha é obrigatória' })
            return
        }

        //check if users not exists
        const user = await User.findOne({ email: email })

        if (!user) {
            res.status(422).json({ message: 'Cadastro não encontrado' })
            return
        }

        //check if password match with db password
        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
            res.status(422).json({ message: 'Senha inválida' })
            return
        }

        await createUserToken(user, req, res)
    }

    static async checkUser(req, res) {
        let currentUser

        if (req.headers.authorization) {

            const token = getToken(req)
            const decoded = jwt.verify(token, 'secret')

            currentUser = await User.findById(decoded.id)

            currentUser.password = undefined

        } else {
            currentUser = null
        }

        res.status(200).send(currentUser)
    }

    static async getUserById(req, res) {
        const id = req.params.id
        const user = await User.findById(id).select('-password')

        if (!user) {
            res.status(422).json({
                message: 'Usuário não encontrado',
            })
            return
        }

        res.status(200).json({ user })
    }

    static async editUser(req, res) {
        const id = req.params.id

        //check if user exists
        const token = getToken(req)
        const user = await getUserByToken(token)

        const { name, email, phone, password, confirmpassword } = req.body

        if (req.file) {
            user.image = req.file.filename
        }

        // validations
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório' })
            return
        }

        user.name = name

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório' })
            return
        }       

        //check if email has alredy taken => comentei essa parte pq qdo ia fazer o patch retornava que esse email já estava cadastrado
        // const userExists = await User.findOne({ email: email })

        // if (!user.email !== email && userExists) {
        //     res.status(422).json({message: 'E-mail já cadastrado',})
        //     return
        // } 

        user.email = email

        if (!phone) {
            res.status(422).json({ message: 'O telefone é obrigatório' })
            return
        }

        user.phone = phone

        // if (password != confirmpassword) {
        //     res.status(422).json({ message: 'As senhas não são iguais' })
        //     return
        // } else if (password === confirmpassword && password != null) {
        //     //create a password
        //     const salt = await bcrypt.genSalt(12)
        //     const passwordHash = await bcrypt.hash(password, salt)

        //     user.password = passwordHash
        // }

         console.log(user)

        try {
            //return user updated data
            await User.findByIdAndUpdate ({ _id: user, _id }, { $set: user }, { new: true })
            res.status(200).json({ message: 'Usuário atualizado com sucesso!' })
        } catch (err) {
            res.status(500).json({ message: err })
            return
        }
    }
}
