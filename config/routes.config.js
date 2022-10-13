const router = require('express').Router();

const fileUploader = require('./cloudinary.config')
const authMiddleware = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');
const usersController = require('../controllers/users.controller');
const adoptionController = require('../controllers/adoption.controller')


router.get('/', (req, res, next) => res.json({ ok: true }));

// create y list de modelo comment
// create y list de modelo like

// AUTH

router.post('/login', authController.login);


// USERS

router.get('/users', usersController.list) // utilizaremos el plural del modelo que vamos a buscar
router.post('/users', usersController.create) // no ponemos un /create porque POST ya indica creación
router.get('/users/me', authMiddleware.isAuthenticated, usersController.getCurrentUser)


// ADOPTION

router.get('/adoptions', adoptionController.list) // veo todas las adopciones que hay diponibles
router.post('/adoptions/create',authMiddleware.isAuthenticated , fileUploader.single('image'), adoptionController.createAdoption)
router.get('/adoptions/:id', adoptionController.detail)














module.exports = router;