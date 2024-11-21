import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Dialog,
  DialogContent,
} from '@mui/material';
import axios from 'axios';
import CoinChart from '../components/CoinChart';
import CoinSearch, { SearchCoin } from '../components/CoinSearch';
import { priceUpdateService, CoinPrice } from '../services/priceUpdates';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

const Dashboard = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setError(null);
        const response = await axios.get<Coin[]>(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 100,
              page: 1,
              sparkline: false,
            },
          }
        );
        setCoins(response.data);
        setFilteredCoins(response.data);

        // Start real-time updates
        priceUpdateService.startUpdates(response.data.map((coin: Coin) => coin.id));
      } catch (error) {
        console.error('Error fetching coins:', error);
        setError('Failed to load cryptocurrency data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();

    // Subscribe to price updates
    const unsubscribe = priceUpdateService.subscribe((prices: CoinPrice[]) => {
      setCoins(prevCoins => {
        const updatedCoins = [...prevCoins];
        prices.forEach(price => {
          const index = updatedCoins.findIndex(coin => coin.id === price.id);
          if (index !== -1) {
            updatedCoins[index] = {
              ...updatedCoins[index],
              current_price: price.current_price,
              price_change_percentage_24h: price.price_change_percentage_24h,
            };
          }
        });
        return updatedCoins;
      });

      // Update filtered coins as well
      setFilteredCoins(prevFiltered => {
        const updatedFiltered = [...prevFiltered];
        prices.forEach(price => {
          const index = updatedFiltered.findIndex(coin => coin.id === price.id);
          if (index !== -1) {
            updatedFiltered[index] = {
              ...updatedFiltered[index],
              current_price: price.current_price,
              price_change_percentage_24h: price.price_change_percentage_24h,
            };
          }
        });
        return updatedFiltered;
      });
    });

    return () => {
      unsubscribe();
      priceUpdateService.stopUpdates();
    };
  }, []);

  const handleCoinSearch = (searchCoin: SearchCoin | null) => {
    if (!searchCoin) {
      setFilteredCoins(coins);
      return;
    }

    const filtered = coins.filter(coin => coin.id === searchCoin.id);
    setFilteredCoins(filtered.length > 0 ? filtered : coins);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <CoinSearch onCoinSelect={handleCoinSearch} />
        {filteredCoins.length !== coins.length && (
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', color: 'primary.main' }}
            onClick={() => handleCoinSearch(null)}
          >
            Clear Search
          </Typography>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {filteredCoins.map((coin) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={coin.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                },
              }}
              onClick={() => setSelectedCoin(coin.id)}
            >
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Box display="flex" alignItems="center">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      style={{ width: 30, height: 30, marginRight: 10 }}
                    />
                    <Typography variant="h6" component="div">
                      {coin.symbol.toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography
                    color={
                      coin.price_change_percentage_24h > 0
                        ? 'success.main'
                        : 'error.main'
                    }
                  >
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {coin.name}
                </Typography>
                <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                  ${coin.current_price.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Market Cap: ${coin.market_cap.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={Boolean(selectedCoin)}
        onClose={() => setSelectedCoin(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedCoin && (
            <>
              <Box sx={{ mb: 3 }}>
                {filteredCoins.map(coin => {
                  if (coin.id === selectedCoin) {
                    return (
                      <Box key={coin.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img
                          src={coin.image}
                          alt={coin.name}
                          style={{ width: 40, height: 40 }}
                        />
                        <Box>
                          <Typography variant="h6">
                            {coin.name} ({coin.symbol.toUpperCase()})
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            color={coin.price_change_percentage_24h >= 0 ? 'success.main' : 'error.main'}
                          >
                            ${coin.current_price.toLocaleString()} ({coin.price_change_percentage_24h.toFixed(2)}%)
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }
                  return null;
                })}
              </Box>
              <CoinChart coinId={selectedCoin} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
