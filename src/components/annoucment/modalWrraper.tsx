"use client";


import { useNewYearModal } from "@/hooks/useNewYearModal";
import NewYearModal from "./NewYearModal";

export default function ModalWrapper() {
  const { showModal, closeModal } = useNewYearModal();
  
  return <NewYearModal isOpen={showModal} onClose={closeModal} />;
}