"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Lead {
    id: string;
    websiteName: string;
    websiteUrl: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    instagram: string;
    linkedin: string;
    industry: string;
    location: string;
    tiktok: string;
    founded: string;
    facebookPixel: string;
    price: number;
    status: string;
}

interface CartContextType {
    cart: Lead[];
    addToCart: (lead: Lead) => void;
    removeFromCart: (leadId: string) => void;
    clearCart: () => void;
    isInCart: (leadId: string) => boolean;
    getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Lead[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("leadhub_cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart from localStorage", error);
            }
        }
    }, []);

    // Save cart to localStorage when it changes
    useEffect(() => {
        localStorage.setItem("leadhub_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (lead: Lead) => {
        if (!isInCart(lead.id)) {
            setCart((prev) => [...prev, lead]);
        }
    };

    const removeFromCart = (leadId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== leadId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const isInCart = (leadId: string) => {
        return cart.some((item) => item.id === leadId);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price || 0), 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isInCart, getCartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
