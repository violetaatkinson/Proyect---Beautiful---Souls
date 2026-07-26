const router = require('express').Router();

const fileUploader = require('./cloudinary.config')
const authMiddleware = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');
const usersController = require('../controllers/users.controller');
const petController = require('../controllers/pet.controller')
const miscController = require('../controllers/misc.controller')
const adoptedController = require('../controllers/adopted.controller')
const messageController = require('../controllers/message.controller')
const notificacionController = require('../controllers/notification.controller')

router.get('/', (req, res, next) => res.json({ ok: true }));

// AUTH
router.post('/login', authController.login);

// USERS
router.get('/users', authMiddleware.isAuthenticated, usersController.list)
router.get('/users/liked', authMiddleware.isAuthenticated, usersController.listWithLikes)
router.post('/users', fileUploader.single('image') , usersController.create)
router.get('/users/me', authMiddleware.isAuthenticated, usersController.getCurrentUser)
router.put('/users/:id', authMiddleware.isAuthenticated, fileUploader.single('image'), usersController.edit)
router.delete('/users/:id/delete',authMiddleware.isAuthenticated, usersController.delete)
router.get("/profile", authMiddleware.isAuthenticated, usersController.profile)

// PETS (rutas siguen en /adoptions por ahora, para no romper el frontend actual)
router.get('/adoptions', authMiddleware.isAuthenticated, petController.list)
router.post('/adoptions/create', authMiddleware.isAuthenticated, fileUploader.single('image'), petController.createPet)
router.get('/adoptions/:id', petController.detail)
router.post('/adoptions/:id', authMiddleware.isAuthenticated, fileUploader.single('image'), petController.edit)
router.delete('/adoptions/:id', authMiddleware.isAuthenticated, petController.delete)
router.get('/myadoptions', authMiddleware.isAuthenticated, petController.getMyPets)

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
router.get('/chat/list', authMiddleware.isAuthenticated , messageController.listChats )
router.get('/chat/:userId', authMiddleware.isAuthenticated , messageController.listMessages)
router.post('/chat/create', authMiddleware.isAuthenticated , messageController.createMessages )

module.exports = router;