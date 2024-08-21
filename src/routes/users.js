const express = require('express');
const router = express.Router();
const user = require('../model/usuario');

// Listar todos os usuários
router.get('/allusers', async (req, res) => {
    try {
      console.log('listando todos os usuários');
      const { page = 1, limit = 10 } = req.query;
  
      
      const skip = (page - 1) * limit;
  
      const users = await user.find()
        .skip(skip)
        .limit(parseInt(limit));
  
      const total = await user.countDocuments();
  
      res.json({
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        users
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;