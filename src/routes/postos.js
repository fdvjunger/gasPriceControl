const express = require('express');
const router = express.Router();
const Posto = require('../model/posto');


// Rota para buscar postos dentro de um raio específico
router.get('/proximos', async (req, res) => {
  try {
    console.log('Buscando postos próximos');
    
    // Obtenha e valide os parâmetros da query
    const { latitude, longitude, raio, combustivel, top = 10, page = 1, limit = 10 } = req.query;
    
    // Validação e conversão dos parâmetros
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const distance = parseFloat(raio) * 1000;

    if (isNaN(lat) || isNaN(lon) || isNaN(distance)) {
      return res.status(400).json({ message: 'Parâmetros inválidos. Certifique-se de fornecer latitude, longitude e raio válidos.' });
    }

    // Calcular o número de documentos a pular (skip) com base na página e no limite
    const skip = (page - 1) * limit;

    // Criar o objeto de filtro para o preço do combustível, se fornecido
    let precoFilter = {};
    if (combustivel) {
      precoFilter[`precosCombustiveis.${combustivel}`] = { $exists: true };
    }

    // Realizar a busca de postos, ordenando pelo preço do combustível, se fornecido
    const postos = await Posto.find({
      localizacao: {
        $geoWithin: {
          $centerSphere: [[lon, lat], distance / 6378.1] // Convertendo km para radianos
        }
      },
      ...precoFilter
    })
    .sort(combustivel ? { [`precosCombustiveis.${combustivel}`]: 1 } : {}) // Ordena pelo preço ascendente se o combustível for especificado
    .skip(skip)
    .limit(parseInt(limit));

    // Filtrar os top 'N' postos com os menores preços, se especificado
    const filteredPostos = combustivel ? postos.slice(0, top) : postos;

    // Contar o total de documentos
    const total = await Posto.countDocuments({
      localizacao: {
        $geoWithin: {
          $centerSphere: [[lon, lat], distance / 6378.1]
        }
      },
      ...precoFilter
    });

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      postos: filteredPostos
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Criar ou atualizar um posto
router.post('/', async (req, res) => {
  console.log('Tentando criar ou atualizar um posto');
  try {
    const { nome, latitude, longitude, endereco, precosCombustiveis } = req.body;

    // Definindo o raio de 10 metros em radianos
    const raioEmMetros = 10;
    const raioEmRadianos = raioEmMetros / 6378100; // Convertendo metros para radianos (6378100 metros é o raio da Terra)

    // Verificar se já existe um posto dentro de um raio de 10 metros
    const postoExistente = await Posto.findOne({
      localizacao: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], raioEmRadianos]
        }
      }
    });

    if (postoExistente) {
      // Atualiza apenas os preços que foram enviados e não são null ou zero
      for (const [key, value] of Object.entries(precosCombustiveis)) {
        if (value !== null && value !== 0) {
          postoExistente.precosCombustiveis[key] = value;
        }
      }

      await postoExistente.save();
      console.log(`Posto ${postoExistente.nome} atualizado com novos preços`);
      return res.status(200).send(postoExistente);
    }

    // Se não existir, crie um novo posto
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
    console.log(`Posto ${novoPosto.nome} criado com sucesso`);
    res.status(201).send(novoPosto);
  } catch (err) {
    console.error('Erro ao criar ou atualizar posto:', err);
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

router.get('/proximidade/:latitude/:longitude', async (req, res) => {
  const { latitude, longitude } = req.params;
  const raioMetros = 10 / 6378137; // 10 metros em radianos

  console.log(`Filtrando posto num raio de 10 metros a partir da localização (${latitude}, ${longitude})`);

  try {
    const postos = await Posto.find({
      localizacao: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], raioMetros]
        }
      }
    });

    if (postos.length === 0) {
      return res.status(404).send('Nenhum posto encontrado dentro do raio de 10 metros');
    }

    res.send(postos);
  } catch (err) {
    console.error('Erro na busca geoespacial:', err);
    res.status(500).send('Erro ao buscar postos');
  }
});


module.exports = router;