import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

interface SiteSettings {
  userFeaturesEnabled: boolean;
}

interface SiteSettingsContextType {
  userFeaturesEnabled: boolean;
  toggleUserFeatures: (adminUid: string) => Promise<void>;
  settingsLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [userFeaturesEnabled, setUserFeaturesEnabled] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'site');
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        // Default to true (enabled) if the field is missing
        setUserFeaturesEnabled(data.userFeaturesEnabled !== false);
      } else {
        // Document doesn't exist yet — treat as enabled
        setUserFeaturesEnabled(true);
      }
      setSettingsLoading(false);
    }, () => {
      // On error, default to enabled so the site still works
      setUserFeaturesEnabled(true);
      setSettingsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleUserFeatures = async (adminUid: string) => {
    const newValue = !userFeaturesEnabled;
    await setDoc(
      doc(db, 'settings', 'site'),
      {
        userFeaturesEnabled: newValue,
        updatedAt: serverTimestamp(),
        updatedBy: adminUid,
      },
      { merge: true }
    );
  };

  return (
    <SiteSettingsContext.Provider value={{ userFeaturesEnabled, toggleUserFeatures, settingsLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
