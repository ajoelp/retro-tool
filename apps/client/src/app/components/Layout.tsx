import React from 'react';
import Column from './Column';
import { Navbar } from './Nav';

export const Layout = () => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        <Column title="Mad"/>
        <Column title="Sad"/>
        <Column title="Glad"/>
      </div>
    </div>
  );
};

export default Layout;
