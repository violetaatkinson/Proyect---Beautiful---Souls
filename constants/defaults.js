module.exports.DEFAULT_AVATAR_URL =
  'https://res.cloudinary.com/plasoironhack/image/upload/v1644663323/ironhack/multer-example/icono-de-li%CC%81nea-perfil-usuario-si%CC%81mbolo-empleado-avatar-web-y-disen%CC%83o-ilustracio%CC%81n-signo-aislado-en-fondo-blanco-192379539_jvh06m.jpg';

// Mismo secreto que usaba auth.middleware.js hardcodeado inline. Lo saco
// a una constante compartida para que el handshake de sockets valide el
// JWT exactamente igual que las rutas REST, sin que el string quede
// duplicado (y pudiendo divergir) en dos archivos.
module.exports.JWT_SECRET = process.env.JWT_SECRET || 'Super secret';