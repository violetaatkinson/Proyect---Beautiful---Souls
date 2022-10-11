const router = require('express').Router();

const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');



router.get('/', (req, res, next) => res.json({ ok: true }));

//crear adopcion create de todos los modelos y un list de todos los modelos

// USERS

router.get('/users', usersController.list) // utilizaremos el plural del modelo que vamos a buscar
router.post('/users', usersController.create) // no ponemos un /create porque POST ya indica creación
router.get('/users/me', authMiddleware.isAuthenticated, usersController.getCurrentUser)


module.exports = router;