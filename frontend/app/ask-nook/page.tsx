"use client";

import { LeftNavigationPane } from "@/components/features/ask-nook/LeftNavigationPane";
import { RightBookPane } from "@/components/features/ask-nook/RightPane";
import { ChatSession } from "@/components/features/ask-nook/ChatSession";
import { useCallback, useState } from "react";


export default function AskNookPage() {
  const [isLeftPaneOpen, setIsLeftPaneOpen] = useState(true);
  const [isRightPaneOpen, setIsRightPaneOpen] = useState(true);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);

  const handleSessionUpdated = useCallback(() => {
    setSessionRefreshKey((key) => key + 1);
  }, []);

  return (
    <main className="flex h-screen w-full overflow-hidden">
      <LeftNavigationPane
        isOpen={isLeftPaneOpen}
        onToggle={() => setIsLeftPaneOpen((open) => !open)}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        sessionRefreshKey={sessionRefreshKey}
      />

      <ChatSession
        activeSessionId={activeSessionId}
        onSessionUpdated={handleSessionUpdated}
      />

      <RightBookPane
        isOpen={isRightPaneOpen}
        onToggle={() => setIsRightPaneOpen((open) => !open)}
        activeSessionId={activeSessionId}
        sessionRefreshKey={sessionRefreshKey}
      />
    </main>
  );
}