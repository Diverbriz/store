const uuid = require('uuid')
const path = require('path')
const fs = require("fs");
const ApiError = require('../error/ApiError')
class File {
    save(file) {
        if (!file) return null
        const [, ext] = file.mimetype.split('/')
        const fileName = uuid.v4() + '.' + ext
        const filePath = path.resolve('static', fileName)
        file.mv(filePath)

        return fileName
    }

    delete(file){
        try{
            fs.unlink(path.resolve(__dirname, '..', 'static', file),
                (err) =>{
                    console.log("Not open")
                })
        } catch (e){
            return new ApiError.badRequest(e.message)
        }
    }
}

module.exports = new File()