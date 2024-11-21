import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

interface CoinChartProps {
  coinId: string;
}

type TimeRange = '1' | '7' | '30' | '90' | '365';

interface PriceData {
  timestamp: number;
  price: number;
}

const CoinChart: React.FC<CoinChartProps> = ({ coinId }) => {
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
          {
            params: {
              vs_currency: 'usd',
              days: timeRange,
            },
          }
        );

        if (!response.data || !response.data.prices || !Array.isArray(response.data.prices)) {
          throw new Error('Invalid data format received from API');
        }

        const formattedData = response.data.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price: Number(price.toFixed(2)), // Round to 2 decimal places
        }));

        setData(formattedData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [coinId, timeRange]);

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: TimeRange | null
  ) => {
    if (newTimeRange) {
      setTimeRange(newTimeRange);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 500 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          aria-label="time range"
          size="small"
        >
          <ToggleButton value="1" aria-label="24 hours">
            24H
          </ToggleButton>
          <ToggleButton value="7" aria-label="7 days">
            7D
          </ToggleButton>
          <ToggleButton value="30" aria-label="30 days">
            30D
          </ToggleButton>
          <ToggleButton value="90" aria-label="90 days">
            90D
          </ToggleButton>
          <ToggleButton value="365" aria-label="1 year">
            1Y
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return timeRange === '1'
                ? date.toLocaleTimeString()
                : date.toLocaleDateString();
            }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            labelFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return timeRange === '1'
                ? date.toLocaleString()
                : date.toLocaleDateString();
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2196f3"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CoinChart;
