const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key'; // Substitua por uma chave secreta real

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token inválido' });
  }
};