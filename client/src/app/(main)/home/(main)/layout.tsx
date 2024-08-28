import CollabSideBar from '@/features/collabs/components/CollabSidebar';
import Sidebar from '../_components/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[40px_minmax(0,1fr)] xs:grid-cols-[80px_minmax(0,1fr)] md:grid-cols-[80px_320px_minmax(0,1fr)] grid-rows-[100%] h-screen">
      <CollabSideBar />
      <Sidebar className="hidden md:flex" />
      {children}
    </div>
  );
}
