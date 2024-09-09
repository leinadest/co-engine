'use client';

import Sidebar from '../_components/Sidebar';
import CollabSideBar from '@/features/collabs/components/CollabSidebar';
import SettingsSideBar from './_components/SettingsSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <CollabSideBar />
      <Sidebar />
      <SettingsSideBar />
      {children}
    </div>
  );
}
