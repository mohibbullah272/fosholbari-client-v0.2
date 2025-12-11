"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, Gift, Trophy, Zap, Star, Rocket, Award, FileText, MessageSquare, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Confetti from "react-confetti";

interface NewYearModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewYearModal({ isOpen, onClose }: NewYearModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFireworks, setShowFireworks] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const slides = [
    {
      title: "🎉 নববর্ষের শুভেচ্ছা!",
      subtitle: "শুভ নববর্ষ ২০২৬",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex justify-center"
          >
            <div className="text-7xl">🎊</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">
              সকল গ্রাহকদের জানাই নববর্ষের অগণিত শুভেচ্ছা!
            </h3>
            
            <div className="flex items-center justify-center gap-3 my-4">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <p className="text-lg font-medium text-foreground">এবারের নববর্ষে নিয়ে এলাম বিশেষ উপহার!</p>
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-primary/10 border border-primary/20 rounded-xl p-5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-lg">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xl text-primary mb-2">বিশেষ ঘোষণা! 🎁</h4>
                <p className="text-foreground">
                  ২০ ডিসেম্বর ২০২৫ থেকে ১ মার্চ ২০২৬ পর্যন্ত প্রতিটি প্রোজেক্টে পাবেন 
                  <span className="font-bold text-primary mx-2">২X এক্সট্রা ROI</span>
                  সুবিধা!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      title: "🚀 ফসল বাড়ি V2 লঞ্চ!",
      subtitle: "এখন আরও সুরক্ষিত, আরও সুন্দর",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-4">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">নতুন ভার্সন লঞ্চড!</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              আপনার প্রিয় <span className="text-primary">ফসল বাড়ি</span> এখন আরও উন্নত
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <motion.div 
                className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">অতিরিক্ত সুরক্ষা ব্যবস্থা</h4>
                  <p className="text-sm text-muted-foreground">এন্ড-টু-এন্ড এনক্রিপশন এবং মাল্টি-লেয়ার সিকিউরিটি</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-primary/10 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">ইনভেস্টমেন্ট সার্টিফিকেট</h4>
                  <p className="text-sm text-muted-foreground">অটোমেটিক PDF জেনারেশন এবং ভেরিফিকেশন</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <motion.div 
                className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">AI ড্রিভেন হেল্প বট</h4>
                  <p className="text-sm text-muted-foreground">২৪/৭ লাইভ চ্যাট এবং ইন্সট্যান্ট সাপোর্ট</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">সুন্দর ইউজার ইন্টারফেস</h4>
                  <p className="text-sm text-muted-foreground">স্মুথ অ্যানিমেশন এবং ইউজার ফ্রেন্ডলি ডিজাইন</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "🔥 ২X এক্সট্রা ROI ক্যাম্পেইন",
      subtitle: "সীমিত সময়ের অফার",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Zap className="w-5 h-5 text-primary animate-pulse" />
              <span className="font-bold text-primary">বিশেষ অফার</span>
              <Zap className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              প্রতিটি প্রোজেক্টে <span className="text-primary">২X এক্সট্রা ROI</span>
            </h3>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5"
            >
              <div className="flex items-center gap-4">
                <Calendar className="w-10 h-10 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground mb-1">সময়সীমা</h4>
                  <p className="text-muted-foreground">
                    ২০ ডিসেম্বর ২০২৫ - ১ মার্চ ২০২৬
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-bold text-foreground mb-1">২X ROI</h4>
                <p className="text-sm text-muted-foreground">ডাবল প্রফিট</p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-bold text-foreground mb-1">সকল প্রোজেক্ট</h4>
                <p className="text-sm text-muted-foreground">প্রতিটি ইনভেস্টমেন্ট</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-secondary/50 border border-border rounded-xl p-4"
            >
              <p className="text-center text-foreground">
                💡 <span className="font-semibold">দ্রুত ইনভেস্ট করুন</span> এবং 
                এই বিশেষ অফারের সুবিধা গ্রহণ করুন!
              </p>
            </motion.div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto advance slides every 8 seconds
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);

    return () => clearInterval(interval);
  }, [isOpen, nextSlide]);

  // Auto-hide fireworks after 5 seconds
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      setShowFireworks(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden border-0 p-0 bg-background/95 backdrop-blur-md">
        {/* Fireworks Effect */}
        {showFireworks && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.1}
              colors={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']}
            />
          </div>
        )}

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Slide Container */}
        <div className="relative h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="p-8 h-full"
            >
              <div className="space-y-2 mb-8 text-center">
                <DialogTitle className="text-3xl font-bold text-foreground">
                  {slides[currentSlide].title}
                </DialogTitle>
                <p className="text-lg text-muted-foreground">
                  {slides[currentSlide].subtitle}
                </p>
              </div>

              {slides[currentSlide].content}

              {/* Slide Indicators */}
              <div className="flex justify-center items-center gap-2 mt-8">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-primary w-8"
                        : "bg-muted hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm border-border"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm border-border"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card/50 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                স্লাইড {currentSlide + 1} / {slides.length}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground"
              >
                পরে দেখবো
              </Button>
              <Button
                onClick={onClose}
                className="bg-primary hover:bg-primary/90"
              >
                শুরু করুন
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}