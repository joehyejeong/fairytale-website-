import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-0">
                {children}
            </main>
        </div>
    );
};

export default Layout;
