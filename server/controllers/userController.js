const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Basket, Device, Type} = require('../models/models')
const {where} = require("sequelize");

const generateJWT = (id, email, role) => {
    return jwt.sign(
        {id, email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'})
}
class UserController {
    async registration(req, res, next) {
        const {email, password, role} = req.body
        if(!email || !password){
            return next(ApiError.badRequest('Некорректный email или password'))
        }
        const candidate = await User.findOne({where: {email}})
        if(candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, role, password: hashPassword})
        const basket = await Basket.create({userId: user.id})
        const token = generateJWT(user.id, user.email, role)
        return res.json(token)
    }

    async filter(req, res){
        let {id, role} = req.query
        let user
        if (id && role){
            user = await User.findAll({where: {id, role} })
        }
        if(!id && role){
           user = await User.findAll({where: {role} })
        }
        if(id && !role){
           user =  await User.findAll({where: {id} })
        }
        if(!id && !role){
            user =  await  User.findAll()
        }
        return res.json(user)
    }

    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if(!user){
            return next(ApiError.internal('Пользователь с таким именем не найден'))
        }

        let comparePassword = bcrypt.compareSync(password, user.password)
        if(!comparePassword){
            return next(ApiError.internal('Указан неверный пароль'))
        }
        const token = generateJWT(user.id, user.email, user.role)
        return res.json({token})
    }

    async check(req, res, next) {
        const token = generateJWT(req.user.id, req.user.email, req.user.role)
        return res.json(token)
        res.json({message: "Все работает"})
    }

    async update(req, res, next) {
        try {
            if (!req.params.id) {
                throw new Error('Не указан id пользователя')
            }
            const user = await User.findByPk(req.params.id)

            const email = req.body.email ?? user.email
            await user.update({email})
            res.json(user)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async delete(req, res, next) {
        try {
            if (!req.params.id) {
                throw new Error('Не указан id пользователя')
            }
            const {id} = req.body

            await User.destroy({where: {id}})
            await Basket.destroy({where: {id}})
            res.json("Удаленый пользователь")
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new UserController()