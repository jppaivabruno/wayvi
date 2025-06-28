const OpenAI = require("openai");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Método não permitido");
    return;
  }

  let rawBody = '';
  for await (const chunk of req) {
    rawBody += chunk;
  }
  let cidade, dias;
  try {
    const data = JSON.parse(rawBody);
    cidade = data.cidade;
    dias = data.dias;
  } catch (e) {
    res.status(400).json({ erro: "Erro ao ler o corpo da requisição." });
    return;
  }

  if (!cidade || !dias) {
    res.status(400).json({ erro: "Cidade e dias são obrigatórios" });
    return;
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `Monte um roteiro completo de viagem para ${cidade} em ${dias} dias, com sugestões de passeios, restaurantes e dicas para cada dia.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    res.status(200).json({ roteiro: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao gerar roteiro." });
  }
};
