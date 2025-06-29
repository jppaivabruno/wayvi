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

  // Lê o body como string
  let rawBody = '';
  for await (const chunk of req) {
    rawBody += chunk;
  }

  let destinos;
  try {
    const data = JSON.parse(rawBody);
    destinos = data.destinos;
  } catch (e) {
    res.status(400).json({ erro: "Erro ao ler o corpo da requisição." });
    return;
  }

  if (!destinos || !Array.isArray(destinos) || destinos.length === 0) {
    res.status(400).json({ erro: "Destinos são obrigatórios" });
    return;
  }

  // Monta prompt multi-destinos
  let prompt = "Monte um roteiro de viagem empolgante com os pontos turísticos que não pode deixar de visitar para o seguinte itinerário:\n";
  destinos.forEach((d, i) => {
    prompt += `- ${d.cidade} (${d.dias} dias)\n`;
  });
  prompt += "Para cada cidade, organize o roteiro dia a dia dividido entre manhã, tarde e noite, sugira passeios e como comprá-los tanto online como físico. Torne a viagem inesquecível! Use uma linguagem empolgante, clara e divida cada cidade por seção.\n";

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.78,
    });
    res.status(200).json({ roteiro: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao gerar roteiro.",
      details: error.message || error.toString(),
      stack: error.stack,
    });
  }
};
