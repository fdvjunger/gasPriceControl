const mongoose = require('mongoose');

const mongoConnect = 'mongodb+srv://fernandovjunger:1234@gimmefuel.iwttv.mongodb.net/?retryWrites=true&w=majority&appName=gimmefuel';


const connectDB = async () => {
  try {
    await mongoose.connect(mongoConnect, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado ao MongoDB');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB', err);
    process.exit(1); 
  }
};

connectDB();

module.exports = connectDB;
