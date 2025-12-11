import ModalWrapper from "@/components/annoucment/modalWrraper";
import { ChatbotProvider } from "@/components/chatbot/chatbotProvider";
import { Footer } from "@/components/shared/Footer";
import { Navbar5 } from "@/components/shared/Navbar";

import { ReactNode } from "react";

const CommonLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative">
      <Navbar5 />
      <main className="flex flex-col min-h-dvh">{children}</main>
      <Footer />
      
      {/* Chatbot Floating Button */}
      <ChatbotProvider />
      
      {/* New Year Announcement Modal - Client Only */}
      <ModalWrapper />
    </div>
  );
};

export default CommonLayout;