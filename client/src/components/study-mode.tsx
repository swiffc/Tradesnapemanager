import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TradingSetupGuide } from "@/components/trading-setup-guide";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Screenshot } from "@shared/schema";

interface StudyModeProps {
  screenshot: Screenshot | null;
  isMobile?: boolean;
  onScreenshotUpdate?: (screenshot: Screenshot) => void;
}

export function StudyMode({ screenshot, isMobile = false, onScreenshotUpdate }: StudyModeProps) {
  const queryClient = useQueryClient();

  const updateScreenshotMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Screenshot> }) => {
      const response = await apiRequest("PUT", `/api/screenshots/${data.id}`, data.updates);
      return response.json() as Promise<Screenshot>;
    },
    onSuccess: (updatedScreenshot) => {
      // Update the cache
      queryClient.invalidateQueries({ queryKey: ["/api/screenshots"] });
      // Notify parent component
      onScreenshotUpdate?.(updatedScreenshot);
    },
  });

  const handleUpdateScreenshot = (updates: Partial<Screenshot>) => {
    if (screenshot?.id) {
      updateScreenshotMutation.mutate({ id: screenshot.id, updates });
    }
  };
  const handleExport = () => {
    console.log("Exporting screenshot and notes");
  };

  const handleZoomIn = () => {
    console.log("Zoom in");
  };

  const handleZoomOut = () => {
    console.log("Zoom out");
  };

  const handleFullScreen = () => {
    console.log("Full screen");
  };

  return (
    <div className="flex flex-col bg-trading-dark h-full">
      {/* Study Header */}
      <div className={`bg-trading-card border-b border-trading-border ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-white font-semibold flex items-center ${isMobile ? 'text-base' : 'text-lg'}`}>
            <i className="fas fa-search-plus mr-2 text-trading-accent"></i>
            Study Mode
          </h2>
          
          <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
            {!isMobile && (
              <>
                <button 
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-trading-border rounded-lg transition-colors" 
                  title="Zoom In"
                  data-testid="button-zoom-in"
                >
                  <i className="fas fa-search-plus text-trading-text"></i>
                </button>
                <button 
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-trading-border rounded-lg transition-colors" 
                  title="Zoom Out"
                  data-testid="button-zoom-out"
                >
                  <i className="fas fa-search-minus text-trading-text"></i>
                </button>
              </>
            )}
            <button 
              onClick={handleFullScreen}
              className={`${isMobile ? 'p-1' : 'p-2'} hover:bg-trading-border rounded-lg transition-colors`} 
              title="Full Screen"
              data-testid="button-fullscreen"
            >
              <i className="fas fa-expand text-trading-text"></i>
            </button>
            <button 
              onClick={handleExport}
              className={`${isMobile ? 'p-1' : 'p-2'} hover:bg-trading-border rounded-lg transition-colors`} 
              title="Export"
              data-testid="button-export"
            >
              <i className="fas fa-download text-trading-text"></i>
            </button>
          </div>
        </div>
      </div>

      {!isMobile ? (
        <ResizablePanelGroup direction="vertical" className="flex-1">
          {/* Image Viewer Area */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full bg-trading-border p-4 flex items-center justify-center">
              <div className="w-full h-full bg-trading-card rounded-lg border-2 border-dashed border-trading-border flex items-center justify-center">
                {screenshot ? (
                  <img 
                    src={screenshot.imagePath.startsWith('http') || screenshot.imagePath.startsWith('data:') ? screenshot.imagePath : `/objects/${screenshot.imagePath.replace('/objects/', '')}`}
                    alt={`${screenshot.title} - detailed view`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    data-testid="img-study-main"
                  />
                ) : (
                  <div className="text-center text-trading-text">
                    <i className="fas fa-image text-4xl mb-4"></i>
                    <p className="text-lg">Select a screenshot to study</p>
                    <p className="text-sm">Click on any screenshot from the gallery to view it here</p>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="h-1 bg-trading-border hover:bg-trading-accent transition-colors" />

          {/* Trading Setup Guide Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <TradingSetupGuide 
              screenshot={screenshot} 
              isMobile={false} 
              onUpdateScreenshot={handleUpdateScreenshot}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        /* Mobile Layout */
        <div className="flex-1 flex flex-col">
          {/* Image Viewer Area */}
          <div className="h-1/2 bg-trading-border p-3 flex items-center justify-center">
            <div className="w-full h-full bg-trading-card rounded-lg border-2 border-dashed border-trading-border flex items-center justify-center">
              {screenshot ? (
                <img 
                  src={screenshot.imagePath.startsWith('http') || screenshot.imagePath.startsWith('data:') ? screenshot.imagePath : `/objects/${screenshot.imagePath.replace('/objects/', '')}`}
                  alt={`${screenshot.title} - detailed view`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  data-testid="img-study-main-mobile"
                />
              ) : (
                <div className="text-center text-trading-text">
                  <i className="fas fa-image text-3xl mb-3"></i>
                  <p className="text-base">Select a screenshot to study</p>
                  <p className="text-sm">Go back to gallery to select a screenshot</p>
                </div>
              )}
            </div>
          </div>

          {/* Trading Setup Guide Panel */}
          <div className="h-1/2 border-t border-trading-border">
            <TradingSetupGuide 
              screenshot={screenshot} 
              isMobile={true} 
              onUpdateScreenshot={handleUpdateScreenshot}
            />
          </div>
        </div>
      )}
    </div>
  );
}
