const OpenAI = require("openai");

module.exports = async (req, res) => {
 res.setHeader("Access-Control-Allow-Origin", "*");
 res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
 res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Origin");

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

 // Monta prompt otimizado (sem estilo de viagem)
 let prompt = `Monte um roteiro de viagem detalhado e empolgante para o seguinte itinerário:\n\n`;
 
 destinos.forEach((d, i) => {
   prompt += `${i + 1}. ${d.cidade} (${d.dias} ${d.dias === 1 ? 'dia' : 'dias'})\n`;
 });
 
 prompt += `\nINSTRUÇÕES ESPECÍFICAS:
 
1. ESTRUTURA DIÁRIA: Organize cada dia em 3 períodos e coloque pelo menos 3 atividades por período, exceto no da noite que pode ser menos:
  -  MANHÃ: Atividades principais e pontos turísticos
  -  TARDE: Continuação das atividades e exploração
  -  NOITE: Atividades noturnas, relaxamento ou vida noturna local

2. FOCO: Priorize sempre os principais pontos turísticos, experiências imperdíveis e atrações mais famosas de cada destino.

3. RESTAURANTES: NÃO inclua restaurantes específicos nas atividades diárias. 

4. Para cada país/cidade, ao final do roteiro daquela localidade, inclua:
  "🍽️ DICAS GASTRONÔMICAS:
  - Top 3 restaurantes mais bem avaliados no TripAdvisor
  - Comidas típicas imperdíveis (ex: Roma - Gelato, Pizza al Taglio, Carbonara; Paris - Croissant, Crème Brûlée, Macaron)"

5. Ao final de TODO o roteiro, inclua uma seção:
  "💡 DICAS ÚTEIS PARA SUA VIAGEM:
  - Transporte: (se Europa = metrô + app CityMapper; se Ásia = apps locais, etc)
  - Apps recomendados para a região
  - Dicas de segurança importantes
  - Informações práticas (moeda, idioma, fusos, etc)
  - Documentação necessária
  
  📱 Roteiro criado por @juutorress
  Siga para mais dicas de viagem incríveis!"

6. Use linguagem empolgante e motivadora. Mencione como adquirir ingressos via GetYourGuide quando relevante.

7. Seja específico sobre horários e organize tudo de forma prática para o viajante seguir facilmente.

8. Para cada destino, inclua informações sobre o clima típico e melhor época para visitar.`;

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