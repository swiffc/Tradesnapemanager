import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from "@/hooks/use-toast";
import type { InsertScreenshot } from '@shared/schema';

interface ProfessionalUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: InsertScreenshot) => Promise<void>;
}

export function ProfessionalUploadModal({ isOpen, onClose, onUpload }: ProfessionalUploadModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    file: null as File | null,
    currencyPair: '',
    sessionTiming: '',
    bias: '',
    setupPattern: '',
    strategyType: '',
    entry: '',
    result: '',
    riskReward: '',
    tags: '',
    notes: '',
    metadata: {}
  });

  // BTMM Options
  const biasOptions = ['M', 'A1', 'A2', 'W', 'V1', 'V2', 'ABS', '3XADR', 'L1_13_50', 'L2_50_200'];
  const setupOptions = ['EMA Respect', 'Symmetrical', 'Extended', 'Box Setups', 'Anchors', 'Asian Range', 'Harmonics P1', 'Reset Safety', 'Resets'];
  const strategyOptions = ['MAAW', 'WVVM', 'Asian Box Stacking', 'EMA Crossover', 'Liquidity Hunt', 'Market Structure Break'];
  const entryOptions = ['1a', '1b', '1c', '2a', '2b', '2c', '3a', '3b', '3c', 'Railroad Tracks', 'Cord of Woods', 'Evening Star', 'Morning Star', 'Shift Candle'];
  const sessionOptions = ['Asian', 'London', 'New York', 'London-NY Overlap'];
  const currencyPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY', 'GBPJPY', 'EURGBP'];

  // File drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, file }));
        if (!formData.title) {
          setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
      }
    }
  }, [formData.title, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, file }));
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!formData.file || !formData.title) {
      toast({
        title: "Missing required fields",
        description: "Please provide a title and select an image.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = async () => {
        const uploadData: InsertScreenshot = {
          title: formData.title,
          imagePath: reader.result as string,
          currencyPair: formData.currencyPair || undefined,
          sessionTiming: formData.sessionTiming || undefined,
          bias: formData.bias || undefined,
          setupPattern: formData.setupPattern || undefined,
          strategyType: formData.strategyType || undefined,
          entry: formData.entry || undefined,
          result: formData.result || undefined,
          riskReward: formData.riskReward || undefined,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
          notes: formData.notes || undefined,
          metadata: {
            uploadedFrom: 'professional-dashboard',
            completionSteps: currentStep,
            ...formData.metadata
          }
        };

        await onUpload(uploadData);
        
        toast({
          title: "Trade uploaded successfully!",
          description: "Your trade has been added to the system.",
        });

        // Reset form
        setFormData({
          title: '',
          file: null,
          currencyPair: '',
          sessionTiming: '',
          bias: '',
          setupPattern: '',
          strategyType: '',
          entry: '',
          result: '',
          riskReward: '',
          tags: '',
          notes: '',
          metadata: {}
        });
        setCurrentStep(1);
        onClose();
      };
      reader.readAsDataURL(formData.file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: "Upload", description: "Select screenshot" },
    { number: 2, title: "Bias", description: "Market direction" },
    { number: 3, title: "Setup", description: "Trading setup" },
    { number: 4, title: "Pattern", description: "Entry pattern" },
    { number: 5, title: "Details", description: "Final details" }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] shadow-2xl">
        {/* Header */}
        <div className="border-b border-[hsl(215,15%,22%)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <i className="fas fa-plus-circle mr-3 text-purple-400"></i>
                Professional Trade Upload
              </h2>
              <p className="text-white/60 mt-1">Follow the BTMM methodology: Bias → Setup → Pattern → Entry</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <i className="fas fa-times text-xl"></i>
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.number
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-purple-500 text-white'
                    : 'border-white/30 text-white/60'
                }`}>
                  {currentStep > step.number ? (
                    <i className="fas fa-check text-sm"></i>
                  ) : (
                    <span className="text-sm font-bold">{step.number}</span>
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-white' : 'text-white/60'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-white/40">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-purple-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Upload Screenshot</h3>
                <p className="text-white/60">Select your trading screenshot to begin analysis</p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : formData.file
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.file ? (
                  <div className="space-y-4">
                    <i className="fas fa-check-circle text-4xl text-green-400"></i>
                    <div>
                      <p className="text-white font-medium">{formData.file.name}</p>
                      <p className="text-white/60 text-sm">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <i className="fas fa-cloud-upload-alt text-4xl text-white/40"></i>
                    <div>
                      <p className="text-white font-medium">Drag & drop your screenshot here</p>
                      <p className="text-white/60">or click to browse files</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button className="bg-gradient-to-r from-purple-500 to-blue-500" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Trade Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., EURUSD London Open Breakout"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className="bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Bias */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Market Bias</h3>
                <p className="text-white/60">Identify the market direction and bias level</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-white">Currency Pair</Label>
                  <Select value={formData.currencyPair} onValueChange={(value) => updateFormData('currencyPair', value)}>
                    <SelectTrigger className="bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white mt-2">
                      <SelectValue placeholder="Select pair" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)]">
                      {currencyPairs.map((pair) => (
                        <SelectItem key={pair} value={pair} className="text-white">
                          {pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Session Timing</Label>
                  <Select value={formData.sessionTiming} onValueChange={(value) => updateFormData('sessionTiming', value)}>
                    <SelectTrigger className="bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white mt-2">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)]">
                      {sessionOptions.map((session) => (
                        <SelectItem key={session} value={session} className="text-white">
                          {session}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white">Bias Level</Label>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {biasOptions.map((bias) => (
                    <button
                      key={bias}
                      onClick={() => updateFormData('bias', bias)}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        formData.bias === bias
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500 text-white'
                          : 'bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white/60 hover:text-white hover:border-blue-500/50'
                      }`}
                    >
                      {bias}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Setup */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Trading Setup</h3>
                <p className="text-white/60">Define the setup pattern and configuration</p>
              </div>

              <div>
                <Label className="text-white">Setup Pattern</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {setupOptions.map((setup) => (
                    <button
                      key={setup}
                      onClick={() => updateFormData('setupPattern', setup)}
                      className={`p-3 rounded-lg border transition-all duration-300 text-sm ${
                        formData.setupPattern === setup
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white'
                          : 'bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white/60 hover:text-white hover:border-green-500/50'
                      }`}
                    >
                      {setup}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pattern */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Strategy Pattern</h3>
                <p className="text-white/60">Select the specific pattern and entry type</p>
              </div>

              <div>
                <Label className="text-white">Strategy Type</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {strategyOptions.map((strategy) => (
                    <button
                      key={strategy}
                      onClick={() => updateFormData('strategyType', strategy)}
                      className={`p-3 rounded-lg border transition-all duration-300 text-sm ${
                        formData.strategyType === strategy
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500 text-white'
                          : 'bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white/60 hover:text-white hover:border-purple-500/50'
                      }`}
                    >
                      {strategy}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-white">Entry Type</Label>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {entryOptions.map((entry) => (
                    <button
                      key={entry}
                      onClick={() => updateFormData('entry', entry)}
                      className={`p-3 rounded-lg border transition-all duration-300 text-sm ${
                        formData.entry === entry
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 text-white'
                          : 'bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white/60 hover:text-white hover:border-orange-500/50'
                      }`}
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Details */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Final Details</h3>
                <p className="text-white/60">Add outcome and additional information</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-white">Result</Label>
                  <Select value={formData.result} onValueChange={(value) => updateFormData('result', value)}>
                    <SelectTrigger className="bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white mt-2">
                      <SelectValue placeholder="Trade outcome" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)]">
                      <SelectItem value="win" className="text-green-400">Win</SelectItem>
                      <SelectItem value="loss" className="text-red-400">Loss</SelectItem>
                      <SelectItem value="breakeven" className="text-yellow-400">Break Even</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Risk:Reward Ratio</Label>
                  <Input
                    placeholder="e.g., 1:3, +2.5R, -1R"
                    value={formData.riskReward}
                    onChange={(e) => updateFormData('riskReward', e.target.value)}
                    className="bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Tags</Label>
                <Input
                  placeholder="e.g., breakout, reversal, momentum (comma separated)"
                  value={formData.tags}
                  onChange={(e) => updateFormData('tags', e.target.value)}
                  className="bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white mt-2"
                />
              </div>

              <div>
                <Label className="text-white">Notes</Label>
                <Textarea
                  placeholder="Add any additional notes about this trade..."
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  className="bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white mt-2 min-h-[100px]"
                />
              </div>

              {/* Summary */}
              <Card className="bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] p-4">
                <h4 className="text-white font-semibold mb-3">Trade Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Pair:</span>
                    <span className="text-white">{formData.currencyPair || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Session:</span>
                    <span className="text-white">{formData.sessionTiming || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">BTMM Flow:</span>
                    <div className="flex space-x-2">
                      <Badge className={formData.bias ? 'bg-blue-500' : 'bg-gray-500'}>
                        {formData.bias || 'B'}
                      </Badge>
                      <Badge className={formData.setupPattern ? 'bg-green-500' : 'bg-gray-500'}>
                        {formData.setupPattern ? 'S' : 'S'}
                      </Badge>
                      <Badge className={formData.strategyType ? 'bg-purple-500' : 'bg-gray-500'}>
                        {formData.strategyType ? 'P' : 'P'}
                      </Badge>
                      <Badge className={formData.entry ? 'bg-orange-500' : 'bg-gray-500'}>
                        {formData.entry ? 'E' : 'E'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[hsl(215,15%,22%)] p-6 flex items-center justify-between">
          <div className="flex space-x-3">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Previous
            </Button>
          </div>

          <div className="text-center">
            <p className="text-white/60 text-sm">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          <div className="flex space-x-3">
            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Next
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isUploading || !formData.file || !formData.title}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isUploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Complete Upload
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
