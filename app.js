require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const logger = require("morgan");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("./config/db.config"); // se conecta a la base de datos que esta en config
const { initSocket } = require("./config/socket.config");

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

// Los controllers acceden al socket con req.app.get('io') para poder
// emitir eventos (ej: message.controller emite message:new al crear un
// mensaje) sin tener que importar el módulo de sockets en cada uno.
app.set("io", io);

app.use(cors());
app.use(logger("dev"));
app.use(express.json()); // Sin esto no sabe usar req.body

const routes = require("./config/routes.config"); // conecto las rutas
app.use("/api", routes);

/* Handle errors */

app.use((req, res, next) => {
	next(createError(404, "Route not found"));
});

app.use((error, req, res, next) => {
	console.log(error);
	if (error instanceof mongoose.Error.ValidationError) {
		error = createError(400, error);
	} else if (error instanceof mongoose.Error.CastError) {
		error = createError(404, "Resource not found");
	} else if (error.message && error.message.includes("E11000")) {
		error = createError(400, "Already exists");
	} else if (error instanceof jwt.JsonWebTokenError) {
		error = createError(401, error);
	} else if (error.name === "MulterError") {
		// Errores del propio multer: archivo muy pesado, demasiados archivos,
		// campo inesperado, etc. Antes caían en el 500 genérico de más abajo.
		error = createError(400, error.message);
	} else if (error.http_code) {
		// Errores que devuelve la API de Cloudinary (formato no soportado,
		// credenciales, límite de plan, etc.) traen su propio http_code.
		const status =
			error.http_code >= 400 && error.http_code < 500 ? error.http_code : 502;
		error = createError(status, error.message || "Image upload failed");
	} else if (!error.status) {
		error = createError(500, error);
	}

	if (error.status >= 500) {
		console.error(error);
	}

	const data = {};
	data.message = error.message;
	data.errors = error.errors
		? Object.keys(error.errors).reduce(
				(errors, key) => ({
					...errors,
					[key]: error.errors[key].message || error.errors[key],
				}),
				{},
			)
		: undefined;

	res.status(error.status).json(data);
});

//PORT
server.listen(process.env.PORT || 3001, () => {
	console.log("App in process at", process.env.PORT || 3001);
});
