import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';

interface PortfolioItem {
  id: string;
  coin: string;
  amount: number;
  purchasePrice: number;
}

interface CoinData {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface PortfolioAnalyticsProps {
  portfolio: PortfolioItem[];
}

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4'];

const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({ portfolio }) => {
  const [coinData, setCoinData] = useState<Record<string, CoinData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoinData = async () => {
      if (portfolio.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              ids: portfolio.map(item => item.coin.toLowerCase()).join(','),
              order: 'market_cap_desc',
              sparkline: false,
            },
          }
        );

        const data: Record<string, CoinData> = {};
        response.data.forEach((coin: any) => {
          data[coin.id] = {
            id: coin.id,
            current_price: coin.current_price,
            price_change_percentage_24h: coin.price_change_percentage_24h,
          };
        });

        setCoinData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching coin data:', error);
        setLoading(false);
      }
    };

    fetchCoinData();
  }, [portfolio]);

  const calculateMetrics = () => {
    let totalValue = 0;
    let totalCost = 0;
    let pieData = [];

    for (const item of portfolio) {
      const coin = coinData[item.coin.toLowerCase()];
      if (coin) {
        const currentValue = item.amount * coin.current_price;
        const costBasis = item.amount * item.purchasePrice;
        totalValue += currentValue;
        totalCost += costBasis;

        pieData.push({
          name: item.coin,
          value: currentValue,
        });
      }
    }

    const totalReturn = totalValue - totalCost;
    const percentageReturn = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalReturn,
      percentageReturn,
      pieData,
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  const metrics = calculateMetrics();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Portfolio Analytics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box height={300}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={metrics.pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {metrics.pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box p={2}>
              <Typography variant="body1" gutterBottom>
                Total Portfolio Value: ${metrics.totalValue.toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Total Cost Basis: ${metrics.totalCost.toLocaleString()}
              </Typography>
              <Typography
                variant="body1"
                gutterBottom
                color={metrics.totalReturn >= 0 ? 'success.main' : 'error.main'}
              >
                Total Return: ${metrics.totalReturn.toLocaleString()} (
                {metrics.percentageReturn.toFixed(2)}%)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                * Values are updated in real-time based on current market prices
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PortfolioAnalytics;
