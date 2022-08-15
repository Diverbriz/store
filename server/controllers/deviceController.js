const uuid = require('uuid')
const path = require('path')
const {Device, DeviceInfo} = require('../models/models')
const ApiError = require('../error/ApiError')
const FileService = require('../services/File')
const fs = require("fs");
class DeviceController {
    async create(req, res, next) {
        try{
            let {name, price, brandId, typeId, info} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            await img.mv(path.resolve(__dirname, '..', 'static', fileName))

            const device = await Device.create({name, price, brandId, typeId, img: fileName})

            if(info){
                info = JSON.parse(info)
                info.forEach(i =>
                    DeviceInfo.create({
                        title: i.title,
                        description: i.description,
                        deviceId: device.id
                    })
                )
            }
            return res.json(device)
        } catch (e){
            next(ApiError.badRequest(e))
        }

    }

    async getAll(req, res) {
        let {brandId, typeId, limit, page} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        let devices;
        if(!devices && !typeId){
            devices = await Device.findAndCountAll({limit, offset})
        }
        if(brandId && !typeId){
            devices = await Device.findAndCountAll({where:{brandId}, limit, offset})
        }

        if(!brandId && typeId){
            devices = await Device.findAndCountAll({where:{typeId}, limit, offset})
        }

        if(brandId && typeId){
            devices = await Device.findAndCountAll({where:{brandId, typeId}, limit, offset})
        }

        return res.json(devices)
    }

    async getOne(req, res){
        const {id} = req.params
        const device = await Device.findOne(
            {
                where: {id},
                include: [{model: DeviceInfo, as: 'info'}]
            },
        )
        return res.json(device)
    }

    async update(req, res, next) {
        try {
            if (!req.params.id) {
                throw new Error('Не указан id товара')
            }
            const device = await Device.findByPk(req.params.id)
            if (!device) {
                throw new Error('Товар не найден в БД')
            }
            const name = req.body.name ?? device.name
            const price = req.body.price ?? device.price
            const img = req.files.img ?? device.img
            if(req.files.img){
                // Удаляем старое изображение
                const imgLast = device.img
                FileService.delete(imgLast)
            }
            const typeId = req.body.typeId ?? device.typeId
            const brandId = req.body.brandId ?? device.brandId

            let fileName = uuid.v4() + ".jpg"

            await img.mv(path.resolve(__dirname, '..', 'static', fileName))
            await device.update({name, price, typeId, brandId, img: fileName})
            res.json(device)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new DeviceController()