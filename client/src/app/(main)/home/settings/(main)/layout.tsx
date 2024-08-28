'use client';

import Sidebar from '../../_components/Sidebar';
import CollabSideBar from '@/features/collabs/components/CollabSidebar';
import SettingsSideBar from '../_components/SettingsSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[80px_200px_minmax(0,1fr)] lg:grid-cols-[80px_320px_200px_minmax(0,1fr)] grid-rows-[100%] h-screen">
      <CollabSideBar />
      <Sidebar className="hidden lg:flex" />
      <SettingsSideBar className="hidden sm:block" />
      {children}
    </div>
  );
}
