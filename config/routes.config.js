const router = require('express').Router();

const fileUploader = require('./cloudinary.config')
const authMiddleware = require('../middlewares/auth.middleware');

const authController = require('../controllers/auth.controller');
const usersController = require('../controllers/users.controller');
const adoptionController = require('../controllers/adoption.controller')
const miscController = require('../controllers/misc.controller')
const adoptedController = require('../controllers/adopted.controller')
const socketController = require('../controllers/socketcontroller')

router.get('/', (req, res, next) => res.json({ ok: true }));


// AUTH

router.post('/login', authController.login);

// USERS

router.get('/users', usersController.list) // utilizaremos el plural del modelo que vamos a buscar
router.post('/users', fileUploader.single('image') , usersController.create) // este seria mi register
router.get('/users/me', authMiddleware.isAuthenticated, usersController.getCurrentUser)
router.put('/users/:id', authMiddleware.isAuthenticated, fileUploader.single('image'), usersController.edit) // edito mi perfil
router.delete('/users/:id',authMiddleware.isAuthenticated, usersController.delete) // elimino mi perfil

router.get("/profile", authMiddleware.isAuthenticated, usersController.profile)

// ADOPTION

router.get('/adoptions', authMiddleware.isAuthenticated, adoptionController.list) // veo todas las adopciones que hay diponibles
//router.get('/adoptions', authMiddleware.isAuthenticated, adoptionController.countAdopted)
router.post('/adoptions/create',authMiddleware.isAuthenticated , fileUploader.single('image'), adoptionController.createAdoption)
router.get('/adoptions/:id', adoptionController.detail)
router.post('/adoptions/:id',authMiddleware.isAuthenticated, adoptionController.edit)
router.delete('/adoptions/:id',authMiddleware.isAuthenticated, adoptionController.delete)
router.get('/myadoptions',authMiddleware.isAuthenticated, adoptionController.getMyAdoptions )

// ADOPTED

router.get('/adopted', adoptedController.adoptedList)
router.post('/adopted/create', authMiddleware.isAuthenticated, fileUploader.single('image'), adoptedController.createAdopted)

// MISC

router.get('/like', authMiddleware.isAuthenticated, miscController.likesList)
router.post('/like/:id', authMiddleware.isAuthenticated, miscController.likes)
router.post('/dislike/:id', authMiddleware.isAuthenticated, miscController.dislikes)

router.get('/comment/:id', authMiddleware.isAuthenticated, miscController.commentList)
router.post('/comment/:id', authMiddleware.isAuthenticated, miscController.comment)
router.post('/comment/:id',authMiddleware.isAuthenticated, miscController.edit)
router.delete("/comment/:id/delete", authMiddleware.isAuthenticated, miscController.delete)


// MESSAGES (SOCKET)

//  router.get('/messages', authMiddleware.isAuthenticated, socketController.selectUser)
//  router.get('/message/:username' , authMiddleware.isAuthenticated, socketController.messages)
//  router.post('/message/:username' , authMiddleware.isAuthenticated, socketController.createMessage )


// NOTIFICATIONS (SOCKET)

 //router.get('/notifications', authMiddleware.isAuthenticated, socketController.notifications )





module.exports = router;

