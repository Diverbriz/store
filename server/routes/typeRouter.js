const Router = require('express')
const router = new Router()
const typeController = require("../controllers/typeController")
const checkRole = require('../middleware/checkRoleMiddleware')
const brandController = require("../controllers/brandController");
router.post('/', checkRole('ADMIN'), typeController.create)
router.delete('/:id', checkRole('ADMIN'), typeController.delete)
router.get('/', typeController.getAll)
router.put('/update/:id', checkRole('ADMIN'), typeController.update)

module.exports = router