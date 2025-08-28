import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Screenshot, Note } from "@shared/schema";

interface NotepadProps {
  screenshot: Screenshot | null;
  isMobile?: boolean;
}

export function Notepad({ screenshot, isMobile = false }: NotepadProps) {
  const [content, setContent] = useState("");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ["/api/screenshots", screenshot?.id, "notes"],
    queryFn: async () => {
      if (!screenshot?.id) return [];
      const response = await fetch(`/api/screenshots/${screenshot.id}/notes`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      return response.json();
    },
    enabled: !!screenshot?.id,
  }) as { data: Note[] };

  const createNoteMutation = useMutation({
    mutationFn: async (data: { screenshotId: string; content: string }) => {
      return apiRequest("POST", `/api/screenshots/${data.screenshotId}/notes`, {
        content: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/screenshots", screenshot?.id, "notes"],
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: { noteId: string; content: string }) => {
      return apiRequest("PUT", `/api/notes/${data.noteId}`, {
        content: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/screenshots", screenshot?.id, "notes"],
      });
    },
  });

  // Load existing note content when screenshot changes
  useEffect(() => {
    if (notes.length > 0) {
      setContent(notes[0].content);
    } else {
      setContent("");
    }
  }, [notes]);

  // Auto-save functionality
  useEffect(() => {
    if (!screenshot || content === (notes[0]?.content || "")) return;

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      if (notes.length > 0) {
        updateNoteMutation.mutate({
          noteId: notes[0].id,
          content,
        });
      } else if (content.trim()) {
        createNoteMutation.mutate({
          screenshotId: screenshot.id,
          content,
        });
      }
    }, 2000);

    setAutoSaveTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [content, screenshot, notes]);

  const handleAnalyzeStrategy = () => {
    if (!screenshot) return;
    console.log("Analyzing strategy performance");
  };

  const handleReviewSetup = () => {
    if (!screenshot) return;
    console.log("Reviewing trade setup");
  };

  const handleBookmark = () => {
    if (!screenshot) return;
    console.log("Bookmarking screenshot");
  };

  const handleExport = () => {
    if (!screenshot) return;
    console.log("Exporting notes");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Notes Header */}
      <div className={`bg-trading-card border-b border-trading-border ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-white font-semibold flex items-center ${isMobile ? 'text-sm' : 'text-base'}`}>
            <i className="fas fa-sticky-note mr-2 text-trading-gold"></i>
            {isMobile ? 'Notes' : 'Trade Notes & Analysis'}
          </h3>
          
          <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
            {!isMobile && (
              <>
                <button 
                  className="p-2 hover:bg-trading-border rounded-lg transition-colors" 
                  title="Format Text"
                  data-testid="button-format-bold"
                >
                  <i className="fas fa-bold text-trading-text"></i>
                </button>
                <button 
                  className="p-2 hover:bg-trading-border rounded-lg transition-colors" 
                  title="Add Bullet Points"
                  data-testid="button-format-list"
                >
                  <i className="fas fa-list-ul text-trading-text"></i>
                </button>
              </>
            )}
            <button 
              className={`${isMobile ? 'p-1' : 'p-2'} hover:bg-trading-border rounded-lg transition-colors`} 
              title="Auto Save"
              data-testid="button-auto-save"
            >
              <i className={`fas fa-save ${
                createNoteMutation.isPending || updateNoteMutation.isPending 
                  ? 'text-bullish animate-pulse' 
                  : 'text-trading-accent'
              }`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className={`flex-1 ${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-br from-yellow-50 to-orange-50`}>
        <div className="bg-white h-full rounded-lg shadow-inner border-l-4 border-l-red-200 relative overflow-hidden">
          {/* Paper lines effect */}
          <div 
            className="absolute inset-0 bg-repeat-y opacity-20" 
            style={{
              backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, #blue 24px)"
            }}
          ></div>
          
          {/* Margin line */}
          <div className={`absolute top-0 ${isMobile ? 'left-8' : 'left-12'} bottom-0 w-px bg-red-200 opacity-30`}></div>
          
          {/* Text area */}
          <textarea 
            className={`relative z-10 w-full h-full ${isMobile ? 'p-4 pl-10 text-sm' : 'p-6 pl-16 text-sm'} bg-transparent border-none outline-none resize-none text-trading-dark leading-6 font-mono`}
            placeholder={
              screenshot 
                ? (isMobile ? "Add your trade analysis..." : "Click to add your trade analysis, setup notes, and lessons learned...")
                : (isMobile ? "Select a screenshot to start..." : "Select a screenshot to start taking notes...")
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!screenshot}
            data-testid="textarea-notes"
          />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className={`bg-trading-card border-t border-trading-border ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex items-center space-x-3'}`}>
          <button 
            onClick={handleAnalyzeStrategy}
            disabled={!screenshot}
            className={`flex items-center ${isMobile ? 'justify-center space-x-1' : 'space-x-2'} bg-trading-accent hover:bg-opacity-80 text-trading-dark ${isMobile ? 'px-2 py-2' : 'px-3 py-2'} rounded-lg ${isMobile ? 'text-xs' : 'text-sm'} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            data-testid="button-analyze-strategy"
          >
            <i className="fas fa-chart-line"></i>
            <span>{isMobile ? 'Analyze' : 'Analyze Strategy'}</span>
          </button>
          
          <button 
            onClick={handleReviewSetup}
            disabled={!screenshot}
            className={`flex items-center ${isMobile ? 'justify-center space-x-1' : 'space-x-2'} bg-purple-600 hover:bg-opacity-80 text-white ${isMobile ? 'px-2 py-2' : 'px-3 py-2'} rounded-lg ${isMobile ? 'text-xs' : 'text-sm'} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            data-testid="button-review-setup"
          >
            <i className="fas fa-search"></i>
            <span>{isMobile ? 'Review' : 'Review Setup'}</span>
          </button>
          
          <button 
            onClick={handleBookmark}
            disabled={!screenshot}
            className={`flex items-center ${isMobile ? 'justify-center space-x-1' : 'space-x-2'} bg-trading-gold hover:bg-opacity-80 text-trading-dark ${isMobile ? 'px-2 py-2' : 'px-3 py-2'} rounded-lg ${isMobile ? 'text-xs' : 'text-sm'} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            data-testid="button-bookmark"
          >
            <i className="fas fa-star"></i>
            <span>{isMobile ? 'Save' : 'Bookmark'}</span>
          </button>
          
          <button 
            onClick={handleExport}
            disabled={!screenshot}
            className={`flex items-center ${isMobile ? 'justify-center space-x-1' : 'space-x-2'} bg-trading-border hover:bg-trading-accent hover:text-trading-dark text-trading-text ${isMobile ? 'px-2 py-2' : 'px-3 py-2'} rounded-lg ${isMobile ? 'text-xs' : 'text-sm'} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            data-testid="button-export-notes"
          >
            <i className="fas fa-share"></i>
            <span>{isMobile ? 'Export' : 'Export'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
