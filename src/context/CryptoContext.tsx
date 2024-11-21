import React, { createContext, useContext, useState, useEffect } from 'react';

interface PriceAlert {
  id: string;
  coinId: string;
  targetPrice: number;
  isAbove: boolean;
}

interface PortfolioItem {
  id: string;
  coin: string;
  amount: number;
  purchasePrice: number;
}

interface CryptoContextType {
  portfolio: PortfolioItem[];
  alerts: PriceAlert[];
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => void;
  removePortfolioItem: (id: string) => void;
  addPriceAlert: (alert: Omit<PriceAlert, 'id'>) => void;
  removePriceAlert: (id: string) => void;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('portfolio');
    return saved ? JSON.parse(saved) : [];
  });

  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('priceAlerts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  }, [alerts]);

  const addPortfolioItem = (item: Omit<PortfolioItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setPortfolio([...portfolio, newItem]);
  };

  const removePortfolioItem = (id: string) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
  };

  const addPriceAlert = (alert: Omit<PriceAlert, 'id'>) => {
    const newAlert = { ...alert, id: Date.now().toString() };
    setAlerts([...alerts, newAlert]);
  };

  const removePriceAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <CryptoContext.Provider
      value={{
        portfolio,
        alerts,
        addPortfolioItem,
        removePortfolioItem,
        addPriceAlert,
        removePriceAlert,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};
