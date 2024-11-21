import axios from 'axios';

export interface CoinPrice {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
}

type PriceUpdateCallback = (prices: CoinPrice[]) => void;

class PriceUpdateService {
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<PriceUpdateCallback> = new Set();
  private coinIds: string[] = [];

  startUpdates(coinIds: string[]) {
    this.coinIds = coinIds;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Initial update
    this.fetchPrices();

    // Set up interval for subsequent updates (every 30 seconds)
    this.updateInterval = setInterval(() => {
      this.fetchPrices();
    }, 30000);
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.subscribers.clear();
  }

  subscribe(callback: PriceUpdateCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private async fetchPrices() {
    if (this.coinIds.length === 0) return;

    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            ids: this.coinIds.join(','),
            order: 'market_cap_desc',
            sparkline: false,
          },
        }
      );

      const prices: CoinPrice[] = response.data.map((coin: any) => ({
        id: coin.id,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
      }));

      this.notifySubscribers(prices);
    } catch (error) {
      console.error('Error fetching price updates:', error);
    }
  }

  private notifySubscribers(prices: CoinPrice[]) {
    this.subscribers.forEach(callback => {
      try {
        callback(prices);
      } catch (error) {
        console.error('Error in price update subscriber:', error);
      }
    });
  }
}

export const priceUpdateService = new PriceUpdateService();
