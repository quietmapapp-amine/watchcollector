import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { user, setUser } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState('fr');
  const [pseudo, setPseudo] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setStep(2);
  };

  const handlePseudoSubmit = async () => {
    if (!pseudo.trim()) {
      Alert.alert(t('common.error'), t('onboarding.pseudoRequired'));
      return;
    }

    setLoading(true);

    try {
      // Check if pseudo is unique
      const { data: existingProfile, error: checkError } = await supabase
        .from('profile')
        .select('id')
        .eq('pseudo', pseudo.trim())
        .single();

      if (existingProfile) {
        Alert.alert(t('common.error'), t('onboarding.pseudoUnique'));
        return;
      }

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      setStep(3);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Create user profile
      const { data: profile, error } = await supabase
        .from('profile')
        .insert({
          id: user.id,
          email: user.email,
          pseudo: pseudo.trim(),
          lang: language,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local user state
      setUser(profile);
      
      // Navigate to main app
      navigation.navigate('Collection' as never);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>{t('onboarding.chooseLanguage')}</Text>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => handleLanguageSelect('fr')}
      >
        <Text style={styles.languageButtonText}>🇫🇷 Français</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => handleLanguageSelect('en')}
      >
        <Text style={styles.languageButtonText}>🇺🇸 English</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>{t('onboarding.setPseudo')}</Text>
      <TextInput
        style={styles.input}
        placeholder="Votre pseudo"
        placeholderTextColor="#A7B0B7"
        value={pseudo}
        onChangeText={setPseudo}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={20}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePseudoSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t('common.loading') : t('common.next')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>{t('onboarding.publicProfile')}</Text>
      <Text style={styles.stepDescription}>
        {t('onboarding.publicProfileDesc')}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.profileButton,
          isPublic && styles.profileButtonActive
        ]}
        onPress={() => setIsPublic(true)}
      >
        <Text style={[
          styles.profileButtonText,
          isPublic && styles.profileButtonTextActive
        ]}>
          🌍 {t('onboarding.publicProfile')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.profileButton,
          !isPublic && styles.profileButtonActive
        ]}
        onPress={() => setIsPublic(false)}
      >
        <Text style={[
          styles.profileButtonText,
          !isPublic && styles.profileButtonTextActive
        ]}>
          🔒 {t('onboarding.privateProfile')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t('common.loading') : t('onboarding.start')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>⌚</Text>
        <Text style={styles.title}>Watch Collector</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${(step / 3) * 100}%` }]} />
        </View>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E8D9B5',
    marginBottom: 24,
    fontFamily: 'DM Serif Display',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 2,
  },
  step: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#A7B0B7',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    color: '#FFFFFF',
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 200,
    alignItems: 'center',
  },
  languageButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 250,
    alignItems: 'center',
  },
  profileButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  profileButtonTextActive: {
    fontWeight: '600',
  },
});
