module.exports = function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  var body = req.body || {};
  var symbol = body.symbol || 'unknown';
  var price = body.price || 0;

  res.status(200).json({
    action: 'HOLD',
    symbol: symbol,
    receivedPrice: price,
    note: 'This is a test response. No real strategy yet.'
  });
};
