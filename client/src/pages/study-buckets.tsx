import { useState, useEffect } from "react";
import { Link } from "wouter";
import { StudyBuckets } from "@/components/study-buckets";
import { StudyMode } from "@/components/study-mode";
import type { Screenshot } from "@shared/schema";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ArrowLeft } from "lucide-react";

export default function StudyBucketsPage() {
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScreenshotSelect = (screenshot: Screenshot) => {
    setSelectedScreenshot(screenshot);
  };

  const handleScreenshotUpdate = (updatedScreenshot: Screenshot) => {
    if (selectedScreenshot?.id === updatedScreenshot.id) {
      setSelectedScreenshot(updatedScreenshot);
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-trading-dark flex flex-col">
        {/* Mobile Header with Back Navigation */}
        <header className="bg-trading-card border-b border-trading-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <Link href="/">
              <button 
                className="flex items-center space-x-2 px-3 py-2 hover:bg-trading-border rounded-lg transition-colors text-trading-text hover:text-white"
                data-testid="button-back-home-mobile"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-lg">Strategy Levels</span>
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </header>

        {!selectedScreenshot ? (
          <div className="flex-1">
            <StudyBuckets 
              onScreenshotSelect={handleScreenshotSelect}
              selectedScreenshot={selectedScreenshot}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="bg-trading-card border-b border-trading-border p-3">
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="flex items-center space-x-2 text-trading-accent hover:text-trading-accent/80 text-sm"
                data-testid="button-back-to-buckets"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Study Buckets</span>
              </button>
            </div>
            <div className="flex-1">
              <StudyMode 
                screenshot={selectedScreenshot}
                isMobile={true}
                onScreenshotUpdate={handleScreenshotUpdate}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-trading-dark flex flex-col">
      {/* Header */}
      <header className="bg-trading-card border-b border-trading-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button 
                className="flex items-center space-x-2 px-3 py-2 hover:bg-trading-border rounded-lg transition-colors text-trading-text hover:text-white"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </Link>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">📊</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Strategy Levels</h1>
              <p className="text-trading-text text-sm">1. BIAS • 2. SETUP • 3. PATTERN • 4. ENTRY'S</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal">
          {/* Study Buckets Panel */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <StudyBuckets 
              onScreenshotSelect={handleScreenshotSelect}
              selectedScreenshot={selectedScreenshot}
            />
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-trading-border hover:bg-trading-accent transition-colors" />

          {/* Study Mode Panel */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <StudyMode 
              screenshot={selectedScreenshot}
              isMobile={false}
              onScreenshotUpdate={handleScreenshotUpdate}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}