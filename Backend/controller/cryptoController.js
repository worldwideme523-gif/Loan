// @desc    Get current crypto prices (BTC, ETH, SOL)
// @route   GET /api/crypto/prices
export const getCryptoPrices = async (req, res, next) => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
    );
    const data = await response.json();

    res.json({
      bitcoin: {
        usd: data.bitcoin?.usd || 0,
        change24h: data.bitcoin?.usd_24h_change || 0
      },
      ethereum: {
        usd: data.ethereum?.usd || 0,
        change24h: data.ethereum?.usd_24h_change || 0
      },
      solana: {
        usd: data.solana?.usd || 0,
        change24h: data.solana?.usd_24h_change || 0
      }
    });
  } catch (error) {
    next(error);
  }
};