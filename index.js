require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/gerar-roteiro', async (req, res) => {
  try {
    const { cidade, dias } = req.body;
    const prompt = `Monte um roteiro completo de viagem para ${cidade} em ${dias} dias, com sugestões de passeios, restaurantes e dicas para cada dia.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    res.json({ roteiro: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ erro: 'Deu erro, tente de novo!' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
