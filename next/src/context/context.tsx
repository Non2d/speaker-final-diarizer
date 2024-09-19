"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextProps {
    pois: number[];
    setPois: (pois: number[]) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pois, setPois] = useState<number[]>([]);

    return (
        <AppContext.Provider value={{ pois, setPois }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};