import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";

interface WaitlistContextValue {
  isOpen: boolean;
  openWaitlist: () => void;
  closeWaitlist: () => void;
}

const WaitlistContext = createContext<WaitlistContextValue | undefined>(undefined);

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  const openWaitlist = useCallback(() => {
    // Record triggering CTA element to restore focus on close (accessibility)
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      triggerElementRef.current = document.activeElement;
    }
    setIsOpen(true);
  }, []);

  const closeWaitlist = useCallback(() => {
    setIsOpen(false);
    // Return focus to triggering button
    setTimeout(() => {
      triggerElementRef.current?.focus();
    }, 50);
  }, []);

  return (
    <WaitlistContext.Provider value={{ isOpen, openWaitlist, closeWaitlist }}>
      {children}
    </WaitlistContext.Provider>
  );
}

export function useWaitlistModal() {
  const context = useContext(WaitlistContext);
  if (!context) {
    throw new Error("useWaitlistModal must be used within a WaitlistProvider");
  }
  return context;
}
