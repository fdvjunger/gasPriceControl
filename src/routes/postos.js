const express = require('express');
const router = express.Router();
const Posto = require('../model/posto');


// Rota para buscar postos dentro de um raio específico
router.get('/proximos', async (req, res) => {
  const { latitude, longitude, raio } = req.query;

  if (!latitude || !longitude || !raio) {
    return res.status(400).send('Latitude, longitude e raio são necessários');
  }

  try {
    const postosProximos = await Posto.find({
      localizacao: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)] // [longitude, latitude]
          },
          $maxDistance: parseFloat(raio) * 1000 // raio em metros
        }
      }
    });

    res.send(postosProximos);
  } catch (err) {
    res.status(500).send(err);
  }
  
});

// Criar um novo posto
router.post('/', async (req, res) => {
  try {
    const { nome, latitude, longitude, endereco, precosCombustiveis } = req.body;

    const novoPosto = new Posto({
      nome,
      latitude,
      longitude,
      endereco,
      precosCombustiveis,
      localizacao: {
        type: 'Point',
        coordinates: [longitude, latitude] // Coordenadas: [longitude, latitude]
      }
    });

    await novoPosto.save();
    res.status(201).send(novoPosto);
  } catch (err) {
    console.error('Erro ao criar posto:', err);
    res.status(400).send(err);
  }
});

// Ler todos os postos
router.get('/', async (req, res) => {
  try {
    const postos = await Posto.find();
    res.send(postos);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Atualizar um posto
router.put('/:id', async (req, res) => {
  try {
    const posto = await Posto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(posto);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Deletar um posto
router.delete('/:id', async (req, res) => {
  try {
    await Posto.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const posto = await Posto.findById(req.params.id);
    if (!posto) {
      return res.status(404).send('Posto não encontrado');
    }
    res.send(posto);
  } catch (err) {
    res.status(500).send(err);
  }
});



module.exports = router;