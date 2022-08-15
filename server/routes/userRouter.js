const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleWare = require('../middleware/authMiddleWare')
const checkRole = require('../middleware/checkRoleMiddleware')

router.get('/', userController.filter)
router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleWare, userController.check)
router.put('/update/:id',checkRole('USER'), userController.update)
router.delete('/delete/:id', checkRole('ADMIN'),userController.delete)
module.exports = router