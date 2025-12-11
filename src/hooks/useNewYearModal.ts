"use client";

import { useState, useEffect } from "react";

const VISITED_KEY = "fosholbari_newyear2026_visited";

export function useNewYearModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem(VISITED_KEY);
    
    // Only show on first visit
    if (!hasVisited) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 2000);

      // Mark as visited
      localStorage.setItem(VISITED_KEY, "true");
      
      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  return {
    showModal,
    closeModal,
    openModal,
  };
}