import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCrypto } from '../context/CryptoContext';
import PriceAlerts from '../components/PriceAlerts';

interface PortfolioItem {
  id: string;
  coin: string;
  amount: number;
  purchasePrice: number;
}

const Portfolio = () => {
  const { portfolio, addPortfolioItem, removePortfolioItem } = useCrypto();
  const [coin, setCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  const handleAddItem = () => {
    if (coin && amount && purchasePrice) {
      addPortfolioItem({
        coin: coin.toUpperCase(),
        amount: parseFloat(amount),
        purchasePrice: parseFloat(purchasePrice),
      });
      setCoin('');
      setAmount('');
      setPurchasePrice('');
    }
  };

  const calculateTotalValue = () => {
    return portfolio.reduce((total, item) => {
      return total + (item.amount * item.purchasePrice);
    }, 0);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add New Position
              </Typography>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Coin Symbol"
                  value={coin}
                  onChange={(e) => setCoin(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Purchase Price (USD)"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddItem}
                  fullWidth
                >
                  Add to Portfolio
                </Button>
              </Box>
            </CardContent>
          </Card>
          <Box sx={{ mt: 3 }}>
            <PriceAlerts />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Portfolio
              </Typography>
              <List>
                {portfolio.map((item) => (
                  <ListItem
                    key={item.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => removePortfolioItem(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`${item.coin}`}
                      secondary={`Amount: ${item.amount} | Purchase Price: $${item.purchasePrice}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="h6">
                  Total Value: ${calculateTotalValue().toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Portfolio;
