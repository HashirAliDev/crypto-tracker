import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import axios from 'axios';

export interface SearchCoin {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number;
}

interface CoinSearchProps {
  onCoinSelect: (coin: SearchCoin | null) => void;
}

const CoinSearch: React.FC<CoinSearchProps> = ({ onCoinSelect }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SearchCoin[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchCoins = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
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

      const filteredCoins = response.data
        .filter((coin: any) =>
          coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          market_cap_rank: coin.market_cap_rank,
        }));

      setOptions(filteredCoins);
    } catch (error) {
      console.error('Error fetching coins:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchCoins(inputValue);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [inputValue]);

  return (
    <Autocomplete
      id="coin-search"
      sx={{ width: 300 }}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => `${option.name} (${option.symbol.toUpperCase()})`}
      options={options}
      loading={loading}
      value={null}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(event, newValue) => {
        onCoinSelect(newValue);
        setOpen(false);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Cryptocurrencies"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              width: '100%',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Typography variant="body1">
              {option.name} ({option.symbol.toUpperCase()})
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 'auto' }}
            >
              Rank #{option.market_cap_rank}
            </Typography>
          </Box>
        </li>
      )}
    />
  );
};

export default CoinSearch;
