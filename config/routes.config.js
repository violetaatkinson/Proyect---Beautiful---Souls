const router = require('express').Router();

const fileUploader = require('./cloudinary.config')
const authMiddleware = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');
const usersController = require('../controllers/users.controller');
const adoptionController = require('../controllers/adoption.controller')
const miscController = require('../controllers/misc.controller')
const adoptedController = require('../controllers/adopted.controller')
const messageController = require('../controllers/message.controller')
const notificacionController = require('../controllers/notification.controller')

router.get('/', (req, res, next) => res.json({ ok: true }));


// AUTH

router.post('/login', authController.login);

// USERS

router.get('/users', authMiddleware.isAuthenticated, usersController.list) // utilizaremos el plural del modelo que vamos a buscar
router.post('/users', fileUploader.single('image') , usersController.create) // este seria mi register
router.get('/users/me', authMiddleware.isAuthenticated, usersController.getCurrentUser)
router.put('/users/:id', authMiddleware.isAuthenticated, fileUploader.single('image'), usersController.edit) // edito mi perfil
router.delete('/users/:id',authMiddleware.isAuthenticated, usersController.delete) // elimino mi perfil

router.get("/profile", authMiddleware.isAuthenticated, usersController.profile)

// ADOPTION

router.get('/adoptions', authMiddleware.isAuthenticated, adoptionController.list) // veo todas las adopciones que hay diponibles
router.post('/adoptions/create',authMiddleware.isAuthenticated , fileUploader.single('image'), adoptionController.createAdoption)
router.get('/adoptions/:id', adoptionController.detail)
router.post('/adoptions/:id',authMiddleware.isAuthenticated, adoptionController.edit)
router.delete('/adoptions/:id',authMiddleware.isAuthenticated, adoptionController.delete)
router.get('/myadoptions',authMiddleware.isAuthenticated, adoptionController.getMyAdoptions )

router.get('/countadopted', adoptionController.alreadyAdopted) // cuenta los adoptados
router.get('/count', adoptionController.countAdopted) // cuenta las adopciones

// ADOPTED

router.get('/adopted', adoptedController.adoptedList)
router.post('/adopted/create', authMiddleware.isAuthenticated, fileUploader.single('image'), adoptedController.createAdopted)

// MISC
router.get('/like', authMiddleware.isAuthenticated, miscController.likesList)
router.post('/like/:id', authMiddleware.isAuthenticated, miscController.likes)
router.post('/dislike/:id', authMiddleware.isAuthenticated, miscController.dislikes)

// NOTIFICATION

router.get('/notifications', authMiddleware.isAuthenticated, notificacionController.notificationList)

// MESSAGES 

router.get('/chat/:userId', authMiddleware.isAuthenticated , messageController.listMessages)
router.post('/chat/create', authMiddleware.isAuthenticated , messageController.createMessages )





module.exports = router;

