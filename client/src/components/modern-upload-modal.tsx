import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { InsertScreenshot } from '@shared/schema';

interface ModernUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: InsertScreenshot & { file: File }) => void;
}

const BIAS_OPTIONS = [
  { value: 'M', label: 'Market Structure (M)', color: 'from-blue-400 to-blue-600' },
  { value: 'A1', label: 'Asian High Break (A1)', color: 'from-cyan-400 to-cyan-600' },
  { value: 'A2', label: 'Asian Low Break (A2)', color: 'from-teal-400 to-teal-600' },
  { value: 'W', label: 'Weekly Bias (W)', color: 'from-indigo-400 to-indigo-600' },
  { value: 'V1', label: 'V-Pattern Bullish (V1)', color: 'from-green-400 to-green-600' },
  { value: 'V2', label: 'V-Pattern Bearish (V2)', color: 'from-red-400 to-red-600' },
  { value: 'ABS', label: 'Asian Box Stacking (ABS)', color: 'from-yellow-400 to-orange-500' },
  { value: '3XADR', label: '3X ADR Extension', color: 'from-purple-400 to-purple-600' }
];

const SETUP_OPTIONS = [
  { value: 'BOX_SETUPS', label: 'Box Range Setups' },
  { value: 'ANCHORS', label: 'Anchor Point Setups' },
  { value: 'ASIAN_RANGE', label: 'Asian Range Manipulation' },
  { value: 'HARMONICS_P1', label: 'Harmonic Patterns Phase 1' },
  { value: 'RESET_SAFETY', label: 'Reset Safety Patterns' },
  { value: 'RESETS', label: 'Standard Reset Patterns' }
];

const ENTRY_OPTIONS = [
  { value: 'RAILROAD_TRACKS', label: 'Railroad Tracks' },
  { value: 'CORD_OF_WOODS', label: 'Cord of Woods' },
  { value: 'EVENING_STAR', label: 'Evening Star' },
  { value: 'MORNING_STAR', label: 'Morning Star' },
  { value: 'SHIFT_CANDLE', label: 'Market Shift Candle' }
];

const SESSION_OPTIONS = [
  { value: 'ASIAN', label: 'Asian Session (21:00-06:00 GMT)' },
  { value: 'LONDON', label: 'London Session (07:00-16:00 GMT)' },
  { value: 'NY', label: 'New York Session (12:00-21:00 GMT)' },
  { value: 'LONDON_NY_OVERLAP', label: 'London/NY Overlap (12:00-16:00 GMT)' },
  { value: 'GAP_TIMES', label: 'Gap Trading Times' },
  { value: 'BRINKS', label: 'Brinks Timing (High Impact News)' }
];

const CURRENCY_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'EURAUD', 'EURCHF', 'GBPCHF'
];

export function ModernUploadModal({ isOpen, onClose, onUpload }: ModernUploadModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    bias: '',
    setupPattern: '',
    entry: '',
    sessionTiming: '',
    currencyPair: '',
    result: '',
    riskReward: '',
    tags: [] as string[]
  });

  const steps = [
    { number: 1, title: 'Upload', icon: 'fas fa-upload', color: 'from-blue-500 to-purple-500' },
    { number: 2, title: 'Bias', icon: 'fas fa-compass', color: 'from-purple-500 to-pink-500' },
    { number: 3, title: 'Setup', icon: 'fas fa-cog', color: 'from-pink-500 to-red-500' },
    { number: 4, title: 'Entry', icon: 'fas fa-crosshairs', color: 'from-red-500 to-orange-500' },
    { number: 5, title: 'Details', icon: 'fas fa-info-circle', color: 'from-orange-500 to-yellow-500' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    
    const uploadData: InsertScreenshot & { file: File } = {
      ...formData,
      file,
      imagePath: '',
      studyBucket: 'BTMM',
      strategyType: formData.setupPattern,
      tags: formData.tags
    };
    
    onUpload(uploadData);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFile(null);
    setPreview(null);
    setFormData({
      title: '',
      bias: '',
      setupPattern: '',
      entry: '',
      sessionTiming: '',
      currencyPair: '',
      result: '',
      riskReward: '',
      tags: []
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return file && formData.title;
      case 2: return formData.bias;
      case 3: return formData.setupPattern;
      case 4: return formData.entry;
      case 5: return formData.sessionTiming && formData.currencyPair;
      default: return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-chart-line text-white"></i>
            </div>
            BTMM Trade Upload
          </DialogTitle>
          <p className="text-white/70">
            Follow Steve Mauro's methodology: Bias → Setup → Pattern → Entry
          </p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep >= step.number 
                  ? `bg-gradient-to-r ${step.color} shadow-lg scale-110` 
                  : 'bg-white/20'
              }`}>
                <i className={`${step.icon} text-white`}></i>
                {currentStep > step.number && (
                  <div className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-white"></i>
                  </div>
                )}
              </div>
              <div className="ml-3 text-sm">
                <div className={`font-medium ${currentStep >= step.number ? 'text-white' : 'text-white/50'}`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                  currentStep > step.number ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/20'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-upload mr-3 text-blue-400"></i>
                Upload Screenshot
              </h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-white text-lg">Trade Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., EURUSD London Open M-Pattern Entry"
                    className="mt-2 bg-white/10 border-white/30 text-white placeholder-white/50 text-lg p-4"
                  />
                </div>

                <div>
                  <Label htmlFor="file" className="text-white text-lg">Screenshot File *</Label>
                  <div className="mt-2 border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-cloud-upload-alt text-white text-2xl"></i>
                      </div>
                      <p className="text-white text-lg">Click to upload or drag & drop</p>
                      <p className="text-white/60 text-sm mt-1">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                </div>

                {preview && (
                  <div className="mt-6">
                    <img src={preview} alt="Preview" className="max-w-full h-64 object-contain rounded-lg border border-white/20 mx-auto" />
                  </div>
                )}
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-compass mr-3 text-blue-400"></i>
                Market Bias Selection
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {BIAS_OPTIONS.map((bias) => (
                  <Card
                    key={bias.value}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      formData.bias === bias.value
                        ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-purple-400 shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 border-white/20'
                    } backdrop-blur-sm`}
                    onClick={() => setFormData(prev => ({ ...prev, bias: bias.value }))}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${bias.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-sm">{bias.value}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{bias.value}</div>
                        <div className="text-white/60 text-sm">{bias.label.split('(')[1]?.replace(')', '') || bias.label}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-cog mr-3 text-green-400"></i>
                Setup Pattern
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SETUP_OPTIONS.map((setup) => (
                  <Card
                    key={setup.value}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      formData.setupPattern === setup.value
                        ? 'bg-gradient-to-r from-green-500/30 to-blue-500/30 border-green-400 shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 border-white/20'
                    } backdrop-blur-sm`}
                    onClick={() => setFormData(prev => ({ ...prev, setupPattern: setup.value }))}
                  >
                    <div className="text-white font-medium mb-2">{setup.value}</div>
                    <div className="text-white/60 text-sm">{setup.label}</div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-crosshairs mr-3 text-orange-400"></i>
                Entry Pattern
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ENTRY_OPTIONS.map((entry) => (
                  <Card
                    key={entry.value}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      formData.entry === entry.value
                        ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 border-orange-400 shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 border-white/20'
                    } backdrop-blur-sm`}
                    onClick={() => setFormData(prev => ({ ...prev, entry: entry.value }))}
                  >
                    <div className="text-white font-medium mb-2">{entry.value}</div>
                    <div className="text-white/60 text-sm">{entry.label}</div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {currentStep === 5 && (
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-info-circle mr-3 text-yellow-400"></i>
                Trade Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white text-lg">Session Timing *</Label>
                  <Select value={formData.sessionTiming} onValueChange={(value) => setFormData(prev => ({ ...prev, sessionTiming: value }))}>
                    <SelectTrigger className="mt-2 bg-white/10 border-white/30 text-white p-4">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      {SESSION_OPTIONS.map((session) => (
                        <SelectItem key={session.value} value={session.value} className="text-white">
                          {session.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white text-lg">Currency Pair *</Label>
                  <Select value={formData.currencyPair} onValueChange={(value) => setFormData(prev => ({ ...prev, currencyPair: value }))}>
                    <SelectTrigger className="mt-2 bg-white/10 border-white/30 text-white p-4">
                      <SelectValue placeholder="Select pair" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      {CURRENCY_PAIRS.map((pair) => (
                        <SelectItem key={pair} value={pair} className="text-white">{pair}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white text-lg">Trade Result</Label>
                  <Select value={formData.result} onValueChange={(value) => setFormData(prev => ({ ...prev, result: value }))}>
                    <SelectTrigger className="mt-2 bg-white/10 border-white/30 text-white p-4">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="win" className="text-green-400">Win 🏆</SelectItem>
                      <SelectItem value="loss" className="text-red-400">Loss ❌</SelectItem>
                      <SelectItem value="breakeven" className="text-yellow-400">Breakeven ⚖️</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="riskReward" className="text-white text-lg">Risk:Reward</Label>
                  <Input
                    id="riskReward"
                    value={formData.riskReward}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskReward: e.target.value }))}
                    placeholder="e.g., +2.5R or -1R"
                    className="mt-2 bg-white/10 border-white/30 text-white placeholder-white/50 p-4"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-white/20">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <i className="fas fa-chevron-left mr-2"></i>
            Previous
          </Button>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>

            {currentStep === 5 ? (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8"
              >
                <i className="fas fa-upload mr-2"></i>
                Upload Trade
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
              >
                Next
                <i className="fas fa-chevron-right ml-2"></i>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
