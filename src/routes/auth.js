const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/usuario');
const router = express.Router();

const secretKey = 'your-secret-key'; // TODO: Substitua por uma chave secreta real

// Rota de registro
router.post('/register', async (req, res) => {
  console.log("registrando novo usuário");
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
    console.log(`Usuário ${user.username} registrado com sucesso`);    
  } catch (err) {
    res.status(400).json({ error: err.message });
    console.log(err); 
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuário não encontrado'); 
      return res.status(404).json({ message: 'Usuário não encontrado' });   
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });
    console.log(`Usuário ${user.username} logado, expira em 1h`); 
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;