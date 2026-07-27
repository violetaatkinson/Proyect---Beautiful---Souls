const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({    
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // De qué mascota se está hablando. Sin esto, dos personas que se
    // escriben por varias mascotas distintas terminaban todas mezcladas
    // en un solo hilo (la confusión de "¿de cuál me estás hablando?").
    // No lo pongo required a nivel de schema para no romper mensajes
    // viejos que ya existan en la base sin este campo; la obligatoriedad
    // para mensajes NUEVOS se valida en el controller.
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
    },
    msg: {
        type: String,
        required: true
    }
},
{
    timestamps: true,
}
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;