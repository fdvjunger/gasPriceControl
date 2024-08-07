const mongoose = require('mongoose');

const PostoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  endereco: { type: String, required: true },
  precosCombustiveis: {
    gasolina: { type: Number },
    etanol: { type: Number},
    diesel: { type: Number},
    gnv: { type: Number}
  },
  dataAtualizacao: { type: Date, default: Date.now },
  localizacao: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  }
});

// Índice geoespacial para consultas de proximidade
PostoSchema.index({ localizacao: '2dsphere' });

module.exports = mongoose.model('Posto', PostoSchema, 'combustiverCtrl');