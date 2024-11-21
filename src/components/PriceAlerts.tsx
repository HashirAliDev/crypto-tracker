import React, { useState } from 'react';
import {
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCrypto } from '../context/CryptoContext';

const PriceAlerts: React.FC = () => {
  const { alerts, addPriceAlert, removePriceAlert } = useCrypto();
  const [coinId, setCoinId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [isAbove, setIsAbove] = useState(true);

  const handleAddAlert = () => {
    if (coinId && targetPrice) {
      addPriceAlert({
        coinId: coinId.toLowerCase(),
        targetPrice: parseFloat(targetPrice),
        isAbove,
      });
      setCoinId('');
      setTargetPrice('');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Price Alerts
        </Typography>
        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Coin ID (e.g., bitcoin)"
            value={coinId}
            onChange={(e) => setCoinId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Target Price (USD)"
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isAbove}
                onChange={(e) => setIsAbove(e.target.checked)}
                color="primary"
              />
            }
            label={`Alert when price goes ${isAbove ? 'above' : 'below'} target`}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddAlert}
            fullWidth
          >
            Add Alert
          </Button>
        </Box>

        <List sx={{ mt: 2 }}>
          {alerts.map((alert) => (
            <ListItem
              key={alert.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => removePriceAlert(alert.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${alert.coinId.toUpperCase()}`}
                secondary={`Alert when price goes ${
                  alert.isAbove ? 'above' : 'below'
                } $${alert.targetPrice.toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default PriceAlerts;
