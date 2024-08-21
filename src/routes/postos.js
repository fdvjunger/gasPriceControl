const express = require('express');
const router = express.Router();
const Posto = require('../model/posto');


// Rota para buscar postos dentro de um raio específico
router.get('/proximos', async (req, res) => {
  try {
    console.log('Buscando postos próximos');
    // Obtenha e valide os parâmetros da query
    const { latitude, longitude, raio, page = 1, limit = 10 } = req.query;
    
    // Validação e conversão dos parâmetros
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const distance = parseFloat(raio) * 1000;
    
    if (isNaN(lat) || isNaN(lon) || isNaN(distance)) {
      return res.status(400).json({ message: 'Parâmetros inválidos. Certifique-se de fornecer latitude, longitude e raio válidos.' });
    }
    
    // Calcular o número de documentos a pular (skip) com base na página e no limite
    const skip = (page - 1) * limit;

    // Realizar a busca de postos
    const postos = await Posto.find({
      localizacao: {
        $geoWithin: {
          $centerSphere: [[lon, lat], distance / 6378.1] // Convertendo km para radianos
        }
      }
    })
    .skip(skip)
    .limit(parseInt(limit));

    // Contar o total de documentos
    const total = await Posto.countDocuments({
      localizacao: {
        $geoWithin: {
          $centerSphere: [[lon, lat], distance / 6378.1]
        }
      }
    });

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      postos
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Criar um novo posto
router.post('/', async (req, res) => {
  console.log('criando novo posto');
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
    console.log(`Posto ${novoPosto.nome} criado com sucesso`)
    res.status(201).send(novoPosto);
  } catch (err) {
    console.error('Erro ao criar posto:', err);
    res.status(400).send(err);
  }
});

// Listar todos os postos
router.get('/', async (req, res) => {
  try {
    console.log('listando todos os postos');
    const { page = 1, limit = 10 } = req.query;

    
    const skip = (page - 1) * limit;

    const postos = await Posto.find()
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Posto.countDocuments();

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      postos
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Atualizar um posto
router.put('/:id', async (req, res) => {
  try {
    const posto = await Posto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log(`Posto ${posto.nome} atualizado`);
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

//filtrar posto por id
router.get('/:id', async (req, res) => {
  console.log(`filtrando posto`);
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