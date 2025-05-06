import React, { ReactNode } from 'react';
import { SideBar } from './SideBar';
import { TopBar } from './TopBar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <SideBar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopBar />
        <main className="pt-16 p-6 overflow-auto h-full">
          <div className="max-w-7xl mx-auto mt-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};