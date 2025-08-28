import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Screenshot } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Brain, Target, TrendingUp, MapPin, Plus, Eye, Edit, ListChecks, Grid3X3 } from "lucide-react";
import { TradingChecklist } from "./trading-checklist";

const STUDY_BUCKETS = [
  { id: "BIAS", name: "1. BIAS", icon: Brain, description: "Strategy Level 1: Market direction & sentiment", color: "bg-blue-500" },
  { id: "SETUPS", name: "2. SETUP", icon: Target, description: "Strategy Level 2: Trading setup patterns", color: "bg-green-500" },
  { id: "PATTERNS", name: "3. PATTERN", icon: TrendingUp, description: "Strategy Level 3: Chart patterns & formations", color: "bg-purple-500" },
  { id: "ENTRY'S", name: "4. ENTRY'S", icon: MapPin, description: "Strategy Level 4: Entry timing & execution", color: "bg-orange-500" }
];

interface StudyBucketsProps {
  onScreenshotSelect?: (screenshot: Screenshot) => void;
  selectedScreenshot?: Screenshot | null;
}

export function StudyBuckets({ onScreenshotSelect, selectedScreenshot }: StudyBucketsProps) {
  const [selectedBucket, setSelectedBucket] = useState<string>("BIAS");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [screenshotToAssign, setScreenshotToAssign] = useState<Screenshot | null>(null);
  const [newBucket, setNewBucket] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add keyboard navigation for buckets (1-4 keys and arrow keys)
  useState(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Number keys 1-4 to quickly switch buckets
      if (event.key >= '1' && event.key <= '4') {
        const bucketIndex = parseInt(event.key) - 1;
        if (bucketIndex < STUDY_BUCKETS.length) {
          setSelectedBucket(STUDY_BUCKETS[bucketIndex].id);
          event.preventDefault();
        }
      }
      // Arrow keys for bucket navigation
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const currentIndex = STUDY_BUCKETS.findIndex(b => b.id === selectedBucket);
        let newIndex;
        if (event.key === 'ArrowLeft') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : STUDY_BUCKETS.length - 1;
        } else {
          newIndex = currentIndex < STUDY_BUCKETS.length - 1 ? currentIndex + 1 : 0;
        }
        setSelectedBucket(STUDY_BUCKETS[newIndex].id);
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  });

  // Get all screenshots for unassigned bucket selection
  const { data: allScreenshots = [] } = useQuery<Screenshot[]>({
    queryKey: ["/api/screenshots"],
  });

  // Get screenshots for selected bucket
  const { data: bucketScreenshots = [], isLoading } = useQuery({
    queryKey: ["/api/screenshots", selectedBucket],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/screenshots?studyBucket=${selectedBucket}`);
        if (!res.ok) {
          console.error(`API error: ${res.status} ${res.statusText}`);
          return [] as Screenshot[];
        }
        const data = await res.json();
        // Ensure we always return an array
        return Array.isArray(data) ? data : [] as Screenshot[];
      } catch (error) {
        console.error('Error fetching bucket screenshots:', error);
        return [] as Screenshot[];
      }
    }
  });

  // Get unassigned screenshots (no study bucket)
  const unassignedScreenshots = allScreenshots.filter((s: Screenshot) => !s.studyBucket);

  const updateScreenshotMutation = useMutation({
    mutationFn: async (data: { id: string; studyBucket: string }) => {
      const response = await apiRequest("PUT", `/api/screenshots/${data.id}`, { studyBucket: data.studyBucket });
      return response.json() as Promise<Screenshot>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/screenshots"] });
      toast({
        title: "Success",
        description: "Screenshot assigned to study bucket successfully",
      });
      setAssignDialogOpen(false);
      setScreenshotToAssign(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign screenshot to study bucket",
        variant: "destructive",
      });
    }
  });

  const handleAssignToBucket = () => {
    if (screenshotToAssign && newBucket) {
      updateScreenshotMutation.mutate({ 
        id: screenshotToAssign.id, 
        studyBucket: newBucket 
      });
    }
  };

  const openAssignDialog = (screenshot: Screenshot) => {
    setScreenshotToAssign(screenshot);
    setNewBucket("");
    setAssignDialogOpen(true);
  };

  const currentBucket = STUDY_BUCKETS.find(b => b.id === selectedBucket);
  const IconComponent = currentBucket?.icon || Brain;

  return (
    <div className="flex flex-col h-full bg-trading-dark">
      {/* Header */}
      <div className="bg-trading-card border-b border-trading-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {currentBucket && <currentBucket.icon className="text-trading-accent w-6 h-6" />}
            <div>
              <h2 className="text-xl font-semibold text-white">
                {currentBucket?.name || 'Study Buckets'}
              </h2>
              <p className="text-trading-text text-sm">
                {currentBucket?.description || 'Select a bucket to begin studying'}
              </p>
            </div>
          </div>
          
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-trading-accent hover:bg-trading-accent/80 text-white border-trading-accent"
                data-testid="button-assign-bucket"
              >
                <Plus className="w-4 h-4 mr-1" />
                Assign
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-trading-card border-trading-border">
              <DialogHeader>
                <DialogTitle className="text-white">Assign Screenshot to Study Bucket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-trading-text mb-2 block">
                    Select Screenshot
                  </label>
                  <Select 
                    value={screenshotToAssign?.id || ""} 
                    onValueChange={(value) => {
                      const screenshot = unassignedScreenshots.find(s => s.id === value);
                      setScreenshotToAssign(screenshot || null);
                    }}
                  >
                    <SelectTrigger className="bg-trading-border border-trading-border text-white">
                      <SelectValue placeholder="Choose a screenshot to assign" />
                    </SelectTrigger>
                    <SelectContent className="z-[100] bg-trading-card border-trading-border shadow-lg">
                      {unassignedScreenshots.map((screenshot: Screenshot) => (
                        <SelectItem 
                          key={screenshot.id} 
                          value={screenshot.id}
                          className="text-white hover:bg-trading-accent focus:bg-trading-accent focus:text-white data-[highlighted]:bg-trading-accent data-[highlighted]:text-white"
                        >
                          {screenshot.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-trading-text mb-2 block">
                    Study Bucket
                  </label>
                  <Select value={newBucket} onValueChange={setNewBucket}>
                    <SelectTrigger className="bg-trading-border border-trading-border text-white">
                      <SelectValue placeholder="Select study bucket" />
                    </SelectTrigger>
                    <SelectContent className="z-[100] bg-trading-card border-trading-border shadow-lg">
                      {STUDY_BUCKETS.map(bucket => (
                        <SelectItem 
                          key={bucket.id} 
                          value={bucket.id}
                          className="text-white hover:bg-trading-accent focus:bg-trading-accent focus:text-white data-[highlighted]:bg-trading-accent data-[highlighted]:text-white"
                        >
                          <div className="flex items-center">
                            <bucket.icon className="w-4 h-4 mr-2" />
                            {bucket.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setAssignDialogOpen(false)}
                    className="border-trading-border text-trading-text hover:bg-trading-border"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAssignToBucket}
                    disabled={!screenshotToAssign || !newBucket || updateScreenshotMutation.isPending}
                    className="bg-trading-accent hover:bg-trading-accent/80"
                    data-testid="button-confirm-assign"
                  >
                    {updateScreenshotMutation.isPending ? "Assigning..." : "Assign"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-trading-text text-sm">
            Progress through the 4 strategy levels for systematic trading analysis
          </p>
          <div className="flex items-center space-x-2 text-xs text-trading-text">
            <span>Quick nav:</span>
            <kbd className="px-1 py-0.5 bg-trading-border rounded text-white">1-4</kbd>
            <span>or</span>
            <kbd className="px-1 py-0.5 bg-trading-border rounded text-white">←→</kbd>
          </div>
        </div>
      </div>

      {/* Primary Bucket Navigation */}
      <div className="bg-trading-dark border-b border-trading-border">
        <div className="flex">
          {STUDY_BUCKETS.map((bucket, index) => {
            const IconComp = bucket.icon;
            const isSelected = selectedBucket === bucket.id;
            const count = selectedBucket === bucket.id ? bucketScreenshots.length : 
              allScreenshots.filter((s: Screenshot) => s.studyBucket === bucket.id).length;
            
            return (
              <button
                key={bucket.id}
                onClick={() => setSelectedBucket(bucket.id)}
                className={`flex-1 p-4 border-b-4 transition-all duration-300 hover:bg-trading-border/30 ${
                  isSelected 
                    ? 'border-trading-accent bg-trading-accent/5 shadow-lg' 
                    : 'border-transparent hover:border-trading-accent/30'
                }`}
                data-testid={`button-bucket-${bucket.id}`}
              >
                <div className="flex flex-col items-center relative">
                  <div className="absolute top-0 right-0">
                    <kbd className={`text-xs px-1 py-0.5 rounded transition-colors ${
                      isSelected 
                        ? 'bg-trading-accent/20 text-trading-accent' 
                        : 'bg-trading-border text-trading-text'
                    }`}>
                      {index + 1}
                    </kbd>
                  </div>
                  <IconComp className={`w-8 h-8 mb-2 transition-all duration-300 ${
                    isSelected ? 'text-trading-accent scale-110' : 'text-trading-text hover:text-white hover:scale-105'
                  }`} />
                  <span className={`text-sm font-bold mb-1 transition-colors ${
                    isSelected ? 'text-trading-accent' : 'text-white'
                  }`}>
                    {bucket.name}
                  </span>
                  <Badge variant="secondary" className={`text-xs mb-1 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-trading-accent text-white scale-105' 
                      : count > 0 
                        ? 'bg-trading-gold/20 text-trading-gold' 
                        : 'bg-trading-border text-trading-text'
                  }`}>
                    {count} {count === 1 ? 'item' : 'items'}
                  </Badge>
                  <p className={`text-xs text-center leading-tight transition-colors ${
                    isSelected ? 'text-trading-accent/90' : 'text-trading-text'
                  }`}>
                    {bucket.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>



      {/* Bucket Summary & Status Bar */}
      <div className="bg-trading-card px-4 py-2 border-b border-trading-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-trading-text">Total Screenshots:</span>
            <Badge variant="secondary" className="bg-trading-dark text-white">
              {allScreenshots.length}
            </Badge>
            <span className="text-trading-text">|</span>
            <span className="text-trading-text">Unassigned:</span>
            <Badge variant="secondary" className={`${
              unassignedScreenshots.length > 0 
                ? 'bg-trading-gold/20 text-trading-gold' 
                : 'bg-trading-border text-trading-text'
            }`}>
              {unassignedScreenshots.length}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-trading-text">Currently viewing:</span>
            <Badge variant="secondary" className="bg-trading-accent/20 text-trading-accent">
              {currentBucket?.name || 'No selection'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content - Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="checklist" className="h-full flex flex-col">
          <div className="bg-trading-card border-b border-trading-border px-4 py-2">
            <TabsList className="bg-trading-border">
              <TabsTrigger value="checklist" className="data-[state=active]:bg-trading-accent data-[state=active]:text-white">
                <ListChecks className="w-4 h-4 mr-2" />
                Checklist
              </TabsTrigger>
              <TabsTrigger value="screenshots" className="data-[state=active]:bg-trading-accent data-[state=active]:text-white">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Screenshots ({bucketScreenshots.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="checklist" className="flex-1 overflow-y-auto m-0">
            <TradingChecklist 
              bucketType={selectedBucket} 
              onComplete={() => {
                toast({
                  title: "Checklist Complete!",
                  description: `${currentBucket?.name} checklist completed successfully.`,
                });
              }}
            />
          </TabsContent>
          
          <TabsContent value="screenshots" className="flex-1 overflow-y-auto m-0 p-4">
        {isLoading ? (
          <div className="text-center text-trading-text py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trading-accent mx-auto mb-2"></div>
            Loading screenshots...
          </div>
        ) : bucketScreenshots.length === 0 ? (
          <div className="text-center py-16">
            <IconComponent className="w-16 h-16 mx-auto text-trading-accent/50 mb-4" />
            <div className="text-trading-accent text-xl font-bold mb-2">
              {currentBucket?.name || 'Bucket'} is Empty
            </div>
            <p className="text-trading-text text-sm mb-6 max-w-md mx-auto">
              {currentBucket?.description}
            </p>
            <div className="space-y-3">
              {unassignedScreenshots.length > 0 ? (
                <div>
                  <p className="text-trading-text text-sm mb-2">
                    You have <span className="text-trading-gold font-medium">{unassignedScreenshots.length} unassigned screenshots</span>
                  </p>
                  <Button 
                    onClick={() => setAssignDialogOpen(true)}
                    className="bg-trading-accent hover:bg-trading-accent/80"
                    data-testid="button-assign-from-empty"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Screenshots to {currentBucket?.name}
                  </Button>
                </div>
              ) : (
                <p className="text-trading-text/70 text-sm">
                  Upload screenshots from the home page to start organizing them by trading concepts
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bucketScreenshots.map((screenshot) => (
              <Card 
                key={screenshot.id} 
                className={`bg-trading-border border-trading-border hover:border-trading-accent transition-colors cursor-pointer ${
                  selectedScreenshot?.id === screenshot.id ? 'border-trading-accent ring-1 ring-trading-accent' : ''
                }`}
                onClick={() => onScreenshotSelect?.(screenshot)}
                data-testid={`card-screenshot-${screenshot.id}`}
              >
                <CardHeader className="p-3">
                  <CardTitle className="text-sm text-white truncate">{screenshot.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {screenshot.imagePath && (
                    <div className="aspect-video mb-3 bg-trading-dark rounded-lg overflow-hidden">
                      <img
                        src={screenshot.imagePath.startsWith('http') || screenshot.imagePath.startsWith('data:') 
                          ? screenshot.imagePath 
                          : `/objects/${screenshot.imagePath.replace('/objects/', '')}`}
                        alt={screenshot.title}
                        className="w-full h-full object-cover"
                        data-testid={`img-screenshot-${screenshot.id}`}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {screenshot.tradeType && (
                        <Badge variant="outline" className="text-xs border-trading-accent text-trading-accent">
                          {screenshot.tradeType}
                        </Badge>
                      )}
                      {screenshot.bias && (
                        <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                          {screenshot.bias}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onScreenshotSelect?.(screenshot);
                        }}
                        className="p-1 h-6 w-6 text-trading-text hover:text-trading-accent"
                        data-testid={`button-view-${screenshot.id}`}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAssignDialog(screenshot);
                        }}
                        className="p-1 h-6 w-6 text-trading-text hover:text-trading-accent"
                        data-testid={`button-reassign-${screenshot.id}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Unassigned Screenshots Counter */}
      {unassignedScreenshots.length > 0 && (
        <div className="bg-trading-card border-t border-trading-border p-4">
          <div className="flex items-center justify-between">
            <div className="text-trading-text">
              <span className="text-sm">Unassigned screenshots: </span>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                {unassignedScreenshots.length}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignDialogOpen(true)}
              className="border-orange-400 text-orange-400 hover:bg-orange-400/10"
              data-testid="button-assign-unassigned"
            >
              Assign {unassignedScreenshots.length} screenshots
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}