import React, { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

export const useInventory = () => {
    return useContext(InventoryContext);
};

const MOCK_INVENTORY = [
    {
        id: '1',
        name: 'Titan Neo Splash',
        model: 'Ti-90123',
        category: 'Men',
        price: 4995,
        costPrice: 2500,
        stock: { wholesale: 50, retail1: 10, retail2: 5 },
        brand: 'Titan',
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop'
    },
    {
        id: '2',
        name: 'Fastrack Reflex',
        model: 'Fa-X100',
        category: 'Unisex',
        price: 2495,
        costPrice: 1200,
        stock: { wholesale: 100, retail1: 20, retail2: 15 },
        brand: 'Fastrack',
        image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop'
    },
    {
        id: '3',
        name: 'Casio Vintage',
        model: 'A168',
        category: 'Men',
        price: 3995,
        costPrice: 1800,
        stock: { wholesale: 20, retail1: 2, retail2: 0 },
        brand: 'Casio',
        image: 'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=400&h=400&fit=crop'
    },
    { id: '4', name: 'Sonata Gold', model: 'So-G776', category: 'Women', price: 1299, costPrice: 600, stock: { wholesale: 80, retail1: 15, retail2: 10 }, brand: 'Sonata', image: null },
    { id: '5', name: 'Timex Expedition', model: 'Tx-E44', category: 'Men', price: 3495, costPrice: 1750, stock: { wholesale: 40, retail1: 8, retail2: 4 }, brand: 'Timex', image: null },
    { id: '6', name: 'Fossil Gen 6', model: 'Fo-Smart', category: 'Smart', price: 18995, costPrice: 12000, stock: { wholesale: 15, retail1: 3, retail2: 1 }, brand: 'Fossil', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop' }
];

export const InventoryProvider = ({ children }) => {
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('meerantimes_products');
        return saved ? JSON.parse(saved) : MOCK_INVENTORY;
    });

    const [sales, setSales] = useState(() => {
        const saved = localStorage.getItem('meerantimes_sales');
        return saved ? JSON.parse(saved) : [];
    });

    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('meerantimes_expenses');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('meerantimes_products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('meerantimes_sales', JSON.stringify(sales));
    }, [sales]);

    useEffect(() => {
        localStorage.setItem('meerantimes_expenses', JSON.stringify(expenses));
    }, [expenses]);

    const addProduct = (product) => {
        setProducts(prev => [...prev, { ...product, id: Date.now().toString() }]);
    };

    const updateStock = (productId, shopId, quantityChange) => {
        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                return {
                    ...p,
                    stock: {
                        ...p.stock,
                        [shopId]: Math.max(0, (p.stock[shopId] || 0) + quantityChange)
                    }
                };
            }
            return p;
        }));
    };

    const getLocalISOString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        const secs = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${mins}:${secs}`;
    };

    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const recordSale = (saleData) => {
        const newSale = {
            ...saleData,
            id: Date.now().toString().slice(-6),
            timestamp: getLocalISOString()
        };
        setSales(prev => [newSale, ...prev]);

        // Reduce stock for each item in the sale
        saleData.items.forEach(item => {
            updateStock(item.id, saleData.shopId, -item.qty);
        });
    };

    const recordExpense = (expenseData) => {
        const newExpense = {
            ...expenseData,
            id: Date.now().toString(),
            timestamp: getLocalISOString()
        };
        setExpenses(prev => [newExpense, ...prev]);
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const updateExpense = (id, updatedData) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedData } : e));
    };

    const getDashboardStats = (shopId) => {
        const todayStr = getTodayStr();

        const shopSales = sales.filter(s => s.shopId === shopId);
        const todaySales = shopSales.filter(s => s.timestamp.startsWith(todayStr));

        const shopExpenses = expenses.filter(e => e.shopId === shopId);
        const todayExpenses = shopExpenses.filter(e => e.timestamp.startsWith(todayStr));

        const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
        const totalExpenseAmount = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalUnits = products.reduce((sum, p) => sum + (p.stock[shopId] || 0), 0);

        return {
            todayRevenue: totalRevenue,
            todayExpenses: totalExpenseAmount,
            totalUnits: totalUnits,
            lowStockCount: products.filter(p => (p.stock[shopId] || 0) <= 5).length
        };
    };

    return (
        <InventoryContext.Provider value={{
            products,
            sales,
            expenses,
            addProduct,
            updateStock,
            recordSale,
            getDashboardStats,
            recordExpense,
            deleteExpense,
            updateExpense
        }}>
            {children}
        </InventoryContext.Provider>
    );
};
