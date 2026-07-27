const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../constants/defaults');

// Cada usuario, al conectarse, se une a una "room" con su propio id.
// Así cualquier controller puede mandarle un evento con
// `io.to(userId).emit(...)` sin tener que llevar un registro manual de
// qué socket.id le corresponde a cada usuario (y sin problemas si tiene
// varias pestañas/dispositivos abiertos, porque todas caen en la misma
// room).
function initSocket(server) {
	const io = new Server(server, {
		cors: { origin: '*' },
	});

	// Mismo JWT que ya usan las rutas REST (mismo secreto, mismo formato
	// { id } en el payload). El front lo manda en el handshake:
	// io(url, { auth: { token } })
	io.use((socket, next) => {
		const token = socket.handshake.auth?.token;

		if (!token) {
			return next(new Error('No auth'));
		}

		jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
			if (err) return next(new Error('Invalid token'));

			socket.userId = decodedToken.id;
			next();
		});
	});

	io.on('connection', (socket) => {
		socket.join(String(socket.userId));

		// Indicador de "escribiendo...": el que escribe emite typing con el
		// id del otro usuario + la mascota de la conversación, y se lo
		// reenviamos solo a ese usuario.
		socket.on('typing', ({ to, pet }) => {
			if (!to) return;
			socket.to(String(to)).emit('typing', {
				from: socket.userId,
				pet,
			});
		});

		socket.on('disconnect', () => {
			socket.leave(String(socket.userId));
		});
	});

	return io;
}

module.exports = { initSocket };
