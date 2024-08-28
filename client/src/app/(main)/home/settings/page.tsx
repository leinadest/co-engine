'use client';

import CollabSideBar from '@/features/collabs/components/CollabSidebar';
import Sidebar from '../_components/Sidebar';
import SettingsSideBar from './_components/SettingsSidebar';
import AccountPage from './(main)/account/page';

export default function SettingsPage() {
  return (
    <div className="grid grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[80px_200px_minmax(0,1fr)] lg:grid-cols-[80px_320px_200px_minmax(0,1fr)] grid-rows-[100%] h-screen">
      <CollabSideBar />
      <Sidebar className="hidden lg:flex" />
      <SettingsSideBar />
      <div className="hidden sm:block">
        <AccountPage />
      </div>
    </div>
  );
}
