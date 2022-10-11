const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const createError = require('http-errors');

require('./config/db.config'); // se conecta a la base de datos que esta en config

const app = express();
app.use(logger('dev'));
app.use(express.json()); // Sin esto no sabe usar req.body

const routes = require('./config/routes.config'); // conecto las rutas
app.use('/api', routes)

/* Handle errors */

app.use((req, res, next) => {
    next(createError(404, 'Route not found'))
  })


//PORT
app.listen(process.env.PORT || 3001, () => {
    console.log('App in process at', process.env.PORT || 3001)
  })