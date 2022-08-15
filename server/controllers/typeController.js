const {Type, Brand} = require('../models/models')
const ApiError = require('../error/ApiError')

class TypeController {
    async create(req, res) {
        const {name} = req.body
        const type = await Type.create({name})
        return res.json(type)
    }

    async getAll(req, res) {
        const types = await Type.findAll()
        return res.json(types)
    }

    async update(req, res){
        try{
            if (!req.params.id) {
                throw new Error('Не указан id товара')
            }
            const type = await Type.findByPk(req.params.id)
            if (!type) {
                throw new Error('Товар не найден в БД')
            }
            const name = req.body.name ?? type.name
            await type.update({name})

            return res.json(type)
        } catch (e){
            throw new ApiError.badRequest(e.message)
        }
    }

    async delete(req, res){
        const {id} = req.body
        const type = await Brand.destroy({where: {id}})
        return res.json(type)
    }

}

module.exports = new TypeController()