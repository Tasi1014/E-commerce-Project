import { createContext, useContext, useState } from "react";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ProfileContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openProfile: () => setIsOpen(true),
        closeProfile: () => setIsOpen(false),
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    return {
      isOpen: false,
      setIsOpen: () => {},
      openProfile: () => {},
      closeProfile: () => {},
    };
  }
  return context;
}
