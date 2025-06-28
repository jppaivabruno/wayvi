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

  // DEBUG: Mostra exatamente o que chega no backend
  let rawBody = '';
  for await (const chunk of req) {
    rawBody += chunk;
  }

  res.status(200).json({
    metodo: req.method,
    headers: req.headers,
    rawBody: rawBody
  });
};
