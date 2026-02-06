import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const useShop = () => {
    return useContext(ShopContext);
};

export const ShopProvider = ({ children }) => {
    // Default to 'wholesale' or read from local storage if persisted
    const [selectedShop, setSelectedShop] = useState(() => {
        return localStorage.getItem('selectedShop') || 'wholesale';
    });

    const SHOPS = {
        wholesale: { id: 'wholesale', name: 'Meeran Wholesale', type: 'inventory_hub' },
        retail1: { id: 'retail1', name: 'Meeran Times (Retail)', type: 'sales_point' },
        retail2: { id: 'retail2', name: 'Daylook (Retail)', type: 'sales_point' }
    };

    const currentShop = SHOPS[selectedShop] || SHOPS['wholesale'];

    const selectShop = (shopId) => {
        setSelectedShop(shopId);
        localStorage.setItem('selectedShop', shopId);
    };

    const value = {
        selectedShop,
        currentShop,
        selectShop,
        SHOPS
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};
