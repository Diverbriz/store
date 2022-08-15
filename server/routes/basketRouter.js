const Router = require('express')
const router = new Router()
const basketController = require("../controllers/basketController")
const authMiddleWare = require('../middleware/authMiddleWare')


router.post('/', authMiddleWare, basketController.addToCart)
router.get('/',authMiddleWare, basketController.getAll)
router.get('/getone',authMiddleWare, basketController.getOne)
router.delete('/clear',authMiddleWare, basketController.clear)
router.delete('/deleteOne', authMiddleWare, basketController.deleteOne)
router.put('/increment', basketController.increment)
router.put('/decrement', basketController.decrement)
// router.put('/product/:productId([0-9]+)/append/:id([0-9]+)', basketController.append)
// router.put('/product/:productId([0-9]+)/increment/:id([0-9]+)', basketController.increment)
// router.put('/product/:productId([0-9]+)/decrement/:id([0-9]+)', basketController.decrement)
// router.put('/product/:productId([0-9]+)/remove', basketController.remove)
// router.put('/clear', basketController.clear)
module.exports = router