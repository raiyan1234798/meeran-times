import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Warehouse, Store, ShoppingBag, ArrowRight } from 'lucide-react';
import '../styles/ShopSelection.css';
import { useShop } from '../contexts/ShopContext';

const SHOPS = [
    {
        id: 'wholesale',
        name: 'Meeran Wholesale',
        type: 'Inventory Hub',
        icon: Warehouse,
        description: 'Main Stock Distribution & Bulk Orders'
    },
    {
        id: 'retail1',
        name: 'Meeran Times (Retail)',
        type: 'Sales & Service',
        icon: Store,
        description: 'City Center Branch - Veppamodu Jn'
    },
    {
        id: 'retail2',
        name: 'Daylook (Retail)',
        type: 'Sales & Service',
        icon: ShoppingBag,
        description: 'Highway Outlet - Main Road'
    }
];

import { useAuth } from '../contexts/AuthContext';

const ShopSelection = () => {
    const navigate = useNavigate();
    const { selectShop } = useShop();
    const { userRole } = useAuth();

    // Filter shops: Only Admin can see Wholesale
    const availableShops = SHOPS.filter(shop => {
        if (userRole === 'admin') return true;
        return shop.id !== 'wholesale';
    });

    const handleSelectShop = (shopId) => {
        selectShop(shopId);
        if (userRole === 'admin') {
            navigate('/');
        } else {
            navigate('/pos');
        }
    };

    return (
        <div className="shop-selection-container">
            <div className="shop-selection-header">
                <h1>Select Workspace</h1>
                <p>Choose a shop to manage sales, inventory, and expenses.</p>
            </div>

            <div className="shops-grid">
                {availableShops.map((shop) => (
                    <div
                        key={shop.id}
                        className="shop-card"
                        onClick={() => handleSelectShop(shop.id)}
                    >
                        <div className="shop-icon-wrapper">
                            <shop.icon size={40} />
                        </div>
                        <h3 className="shop-name">{shop.name}</h3>
                        <div className="shop-role">{shop.type}</div>
                        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            {shop.description}
                        </p>

                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: '#3B82F6', fontWeight: '600', fontSize: '0.9rem' }}>
                            Enter Dashboard <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '3rem', color: '#9CA3AF', fontSize: '0.85rem' }}>
                * Reports will aggregate data from all branches automatically.
            </div>
        </div>
    );
};

export default ShopSelection;
