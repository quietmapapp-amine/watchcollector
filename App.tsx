import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { supabase, onAuthStateChange } from './src/services/supabase';

// Auth & Onboarding Screens
import AuthScreen from './src/screens/Auth/AuthScreen';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';

// Main App Screens
import CollectionScreen from './src/screens/Collection/CollectionScreen';
import AddWatchScreen from './src/screens/AddWatch/AddWatchScreen';
import WatchDetailScreen from './src/screens/WatchDetail/WatchDetailScreen';
import MaintenanceScreen from './src/screens/Maintenance/MaintenanceScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import AlertsScreen from './src/screens/Alerts/AlertsScreen';
import SocialScreen from './src/screens/Social/SocialScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import PaywallScreen from './src/screens/Paywall/PaywallScreen';

// New Extended Screens
import BadgesScreen from './src/screens/Badges/BadgesScreen';
import TimelineScreen from './src/screens/Timeline/TimelineScreen';
import LeaderboardScreen from './src/screens/Leaderboard/LeaderboardScreen';

// AI & OCR Screens
import OCRUploadScreen from './src/screens/OCR/OCRUploadScreen';
import PhotoMatchScreen from './src/screens/PhotoMatch/PhotoMatchScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, session, setUser, setSession, loading, setLoading } = useAuthStore();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Get user profile from database
        const { data: profile } = await supabase
          .from('profile')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(profile || null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        // Get user profile from database
        const { data: profile } = await supabase
          .from('profile')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(profile || null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {!user ? (
            // Auth & Onboarding Stack
            <>
              <Stack.Screen 
                name="Auth" 
                component={AuthScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Onboarding" 
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            // Main App Stack
            <>
              <Stack.Screen 
                name="Collection" 
                component={CollectionScreen}
                options={{ title: 'Ma Collection' }}
              />
              <Stack.Screen 
                name="AddWatch" 
                component={AddWatchScreen}
                options={{ title: 'Ajouter une montre' }}
              />
              <Stack.Screen 
                name="WatchDetail" 
                component={WatchDetailScreen}
                options={{ title: 'Détails de la montre' }}
              />
              <Stack.Screen 
                name="Maintenance" 
                component={MaintenanceScreen}
                options={{ title: 'Entretien' }}
              />
              <Stack.Screen 
                name="Dashboard" 
                component={DashboardScreen}
                options={{ title: 'Tableau de bord' }}
              />
              <Stack.Screen 
                name="Alerts" 
                component={AlertsScreen}
                options={{ title: 'Alertes' }}
              />
              <Stack.Screen 
                name="Social" 
                component={SocialScreen}
                options={{ title: 'Social' }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{ title: 'Paramètres' }}
              />
              <Stack.Screen 
                name="Paywall" 
                component={PaywallScreen}
                options={{ title: 'Premium' }}
              />
              
              {/* New Extended Screens */}
              <Stack.Screen 
                name="Badges" 
                component={BadgesScreen}
                options={{ title: 'Mes Badges' }}
              />
              <Stack.Screen 
                name="Timeline" 
                component={TimelineScreen}
                options={{ title: 'Timeline' }}
              />
              <Stack.Screen 
                name="Leaderboard" 
                component={LeaderboardScreen}
                options={{ title: 'Classement' }}
              />
              
              {/* AI & OCR Screens */}
              <Stack.Screen 
                name="OCRUpload" 
                component={OCRUploadScreen}
                options={{ title: 'Scanner Facture' }}
              />
              <Stack.Screen 
                name="PhotoMatch" 
                component={PhotoMatchScreen}
                options={{ title: 'Reconnaissance Photo' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
