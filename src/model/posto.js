const mongoose = require('mongoose');

const PostoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  endereco: { type: String, required: true },
  precosCombustiveis: {
    gasolina: { type: Number, required: true },
    etanol: { type: Number, required: true },
    diesel: { type: Number, required: true },
    gnv: { type: Number, required: true }
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