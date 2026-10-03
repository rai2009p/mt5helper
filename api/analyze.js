module.exports = async function (req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    var body = req.body || {};
    var imageBase64 = body.imageBase64;
    var mimeType = body.mimeType || 'image/png';
    var notes = (body.notes || '').trim();
    var apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'API key is missing in Vercel.' });
    }
    if (!imageBase64) {
      return res.status(400).json({ message: 'Please upload a chart screenshot.' });
    }

    var prompt = 'You are looking at a trading chart screenshot. Describe: 1) the overall trend, 2) any visible support/resistance levels, 3) any chart patterns or candlestick signals you notice, 4) possible bullish and bearish scenarios with rough likelihood, 5) key risks to watch. Be specific but concise. End by reminding the reader this is not financial advice.';
    if (notes) {
      prompt += ' Additional context from the trader: ' + notes;
    }

    var r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
              { text: prompt }
            ]
          }]
        })
      }
    );

    var data = await r.json();

    if (!r.ok) {
      var msg = data.error && data.error.message ? data.error.message : String(r.status);
      return res.status(500).json({ message: 'AI error: ' + msg });
    }

    var text = 'No result returned.';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      text = data.candidates[0].content.parts.map(function (p) { return p.text || ''; }).join('');
    }

    return res.status(200).json({ message: text });
  } catch (e) {
    return res.status(500).json({ message: 'Error: ' + e.message });
  }
};
