const router = require('express').Router();

const fileUploader = require('./cloudinary.config')
const authMiddleware = require('../middlewares/auth.middleware');

const authController = require('../controllers/auth.controller');
const usersController = require('../controllers/users.controller');
const adoptionController = require('../controllers/adoption.controller')
const miscController = require('../controllers/misc.controller')

router.get('/', (req, res, next) => res.json({ ok: true }));


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
// router.get('/dogs', adoptionController.filterDogs)

router.delete('/adoptions/:id',authMiddleware.isAuthenticated, adoptionController.delete);


// MISC

//router.get('/comment', authMiddleware.isAuthenticated, miscController.commentList)
//router.post('/comment', authMiddleware.isAuthenticated, miscController.comment)
//router.get('/like', authMiddleware.isAuthenticated, miscController.likesList)
//router.post('/like', authMiddleware.isAuthenticated, miscController.likes)



module.exports = router;