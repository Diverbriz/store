const {Brand, Type, Device} = require('../models/models')
const ApiError = require('../error/ApiError')

class BrandController {
    async create(req, res) {
        const {name} = req.body
        console.log(req.host)
        const brand = await Brand.create({name})
        return res.json(brand)
    }

    async getAll(req, res) {
        const brands = await Brand.findAll()
        return res.json(brands)
    }

    async update(req, res){
        try{
            if (!req.params.id) {
                throw new Error('Не указан id товара')
            }
            const brand = await Brand.findByPk(req.params.id)
            if (!brand) {
                throw new Error('Товар не найден в БД')
            }
            const name = req.body.name ?? brand.name
            await brand.update({name})

            return res.json(brand)
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

module.exports = new BrandController()