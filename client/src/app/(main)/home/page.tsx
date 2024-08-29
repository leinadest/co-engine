'use client';

import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';

import CollabSideBar from '@/features/collabs/components/CollabSidebar';
import Sidebar from './_components/Sidebar';
import ChatPage from './(main)/chat/[chatId]/page';
import useLocalStorage from '@/hooks/useLocalStorage';
import ChatPageLayout from './(main)/chat/[chatId]/layout';
import Error from '@/app/error';

export default function Home() {
  const [storage] = useLocalStorage('lastChatId');
  const [lastChatId, setLastChatId] = useState('');

  useEffect(() => setLastChatId(storage.lastChatId), [storage.lastChatId]);

  return (
    <div className="grid grid-cols-[40px_minmax(0,1fr)] xs:grid-cols-[80px_minmax(0,1fr)] md:grid-cols-[80px_320px_minmax(0,1fr)] grid-rows-[100%] h-screen bg-bgPrimary">
      <CollabSideBar />
      <Sidebar />
      {lastChatId ? (
        <div className="hidden md:flex">
          <ErrorBoundary errorComponent={Error}>
            <ChatPageLayout params={{ chatId: lastChatId }}>
              <ChatPage params={{ chatId: lastChatId }} />
            </ChatPageLayout>
          </ErrorBoundary>
        </div>
      ) : (
        <main className="hidden md:flex justify-center items-center">
          <h1 className="text-6xl text-bgSecondary dark:text-bgSecondary-dark">
            home
          </h1>
        </main>
      )}
    </div>
  );
}
