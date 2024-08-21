const express = require('express');
const mongoose = require('./src/db/connect'); 
const authMiddleware = require('./src/middleware/auth');
const authRouter = require('./src/routes/auth');
const routes = require('./src/routes');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth', authRouter);

app.use(authMiddleware);

app.use('/api', routes);


// Rota protegida
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Acesso concedido' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
