import CollabSideBar from '@/features/collabs/components/CollabSidebar';
import Sidebar from '../_components/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen">
      <CollabSideBar />
      <Sidebar />
      {children}
    </div>
  );
}
