const {Basket, BasketDevice, Device} = require('../models/models')
const ApiError = require('../error/ApiError')
const jwt = require('jsonwebtoken')
const maxAge = 60 * 60 * 1000 * 24 * 365 // один год
const signed = true

// Возвращает id зарегестрированного пользователя
const authId = (req,res) => {
    try{
        const token = req.headers.authorization.split(' ')[1]
        if(!token){
            return res.status(401).json({message: "Не авторизован"})
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        return decoded.id
    } catch (e){
        res.status(401).json({message: "Не авторизован"})
    }
}

// Проверка на пустой объект
function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

// Сокращенный икремент и декремент
const score = async (req, res, char) => {
    const id = authId(req, res)
    const {deviceId} = req.body
    const device = await BasketDevice.findOne({where: {deviceId, basketId: id}})
    if (!device) {
        return res.json("Такого устройства нет в БД")
    }
    if (char === 0) {
        let quantity = device.quantity
        quantity = quantity - 1
        if(quantity <= 0){
            device.destroy()
            return res.json("Товар удален")
        }

        device.update({quantity})

    } else if (char === 1) {
        const quantity = device.quantity + 1
        device.update({quantity})

    }
    return res.json(device)
}
// Контроллер корзины
class BasketController {
    async addToCart(req, res, next) {
        try {
            const {deviceId} = req.body
            const id = authId(req,res)
            const device = await Device.findOne({where: {id:deviceId}})
            if(!device){ // Если устройства нет в БД
                return res.json("Такого устройства нет в БД")
            }
            const temp = await BasketDevice.findOne({where: {basketId: id, deviceId: deviceId}})
            let basketDevices
            if(!temp){ //
                basketDevices = await BasketDevice.create({basketId: id, deviceId: deviceId})
            }
            if(temp){
                basketDevices = await BasketDevice.findOne({where: {basketId: id, deviceId}})
                const quantity = await basketDevices.getDataValue('quantity')+1
                basketDevices.update({quantity: quantity})
            }
            return res.json(basketDevices)
        } catch (e){
            next(ApiError.badRequest("Непредвиденная ошибка при добавлении в корзину"))
        }
    }

    async getOne(req, res, next) {
        try {
            let basket
            if (req.signedCookies.basketId) {
                basket = await BasketDevice.findOne(parseInt(req.signedCookies.basketId))
            } else {
                basket = await BasketDevice.create()
            }
            res.cookie('basketId', basket.id, {maxAge, signed})
            res.json(basket)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try{
            const id = authId(req, res)
            const basket = await BasketDevice.findAll({where: {basketId: id}})
            if (isEmptyObject(basket)){
                return res.json("В корзине нет товаров")
            }

            return res.json(basket)
        } catch (e){
            next(ApiError.badRequest("Произошла непредвиденная ошибка"))
        }
    }

    async increment(req, res, next){
        try{
            await score(req, res, 1) // 0 - уменьшение, 1 - увеличение
        } catch (e){
            next(ApiError.badRequest("Ошибка при увеличении количества товара"))
        }
    }
    // Уменьшение количества товара
    async decrement(req, res, next){
        try{
            await score(req, res, 0) // 0 - уменьшение, 1 - увеличение
        } catch (e){
            next(ApiError.badRequest("Ошибка при уменьшении количества товара"))
        }
    }

    async deleteOne(req, res){
        const id = authId(req, res)
        const {deviceId} = req.body
        try {
            const basketDevice = await BasketDevice.findOne({where: {deviceId, basketId: id}})
            return res.json(basketDevice)
        } catch (e){
            throw new ApiError.internal("Ошибка сервера")
        }
    }

    async clear(req, res){
        const id = authId(req, res)
        try {
            const basketDevice = await BasketDevice.destroy({where: { basketId: id}})
            if (!basketDevice){
                return res.json("В корзине нет товаров")
            }
            return res.json(basketDevice)
        } catch (e){
            throw new ApiError.internal("Ошибка сервера")
        }
    }
}

module.exports = new BasketController()