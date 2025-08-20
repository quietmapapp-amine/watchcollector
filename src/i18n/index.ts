import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      // Common
      common: {
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        cancel: 'Annuler',
        save: 'Enregistrer',
        delete: 'Supprimer',
        edit: 'Modifier',
        add: 'Ajouter',
        search: 'Rechercher',
        filter: 'Filtrer',
        sort: 'Trier',
        close: 'Fermer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        done: 'Terminé',
        retry: 'Réessayer',
      },
      
      // Auth
      auth: {
        signIn: 'Se connecter',
        signUp: 'S\'inscrire',
        signOut: 'Se déconnecter',
        email: 'Email',
        password: 'Mot de passe',
        forgotPassword: 'Mot de passe oublié ?',
        noAccount: 'Pas de compte ?',
        hasAccount: 'Déjà un compte ?',
        signInWithGoogle: 'Se connecter avec Google',
        signInWithApple: 'Se connecter avec Apple',
        emailRequired: 'Email requis',
        passwordRequired: 'Mot de passe requis',
        invalidEmail: 'Email invalide',
        passwordTooShort: 'Mot de passe trop court',
      },
      
      // Onboarding
      onboarding: {
        welcome: 'Bienvenue sur Watch Collector',
        chooseLanguage: 'Choisissez votre langue',
        setPseudo: 'Choisissez votre pseudo',
        pseudoRequired: 'Pseudo requis',
        pseudoUnique: 'Ce pseudo est déjà pris',
        publicProfile: 'Profil public',
        publicProfileDesc: 'Permettre aux autres de voir votre collection',
        privateProfile: 'Profil privé',
        privateProfileDesc: 'Votre collection reste privée',
        start: 'Commencer',
      },
      
      // Collection
      collection: {
        title: 'Ma Collection',
        empty: 'Aucune montre dans votre collection',
        addFirst: 'Ajouter votre première montre',
        addWatch: 'Ajouter une montre',
        totalWatches: '{{count}} montre',
        totalWatches_plural: '{{count}} montres',
        totalValue: 'Valeur totale',
        searchPlaceholder: 'Rechercher par marque, modèle...',
        filterByBrand: 'Filtrer par marque',
        filterByCondition: 'Filtrer par état',
        sortByDate: 'Trier par date',
        sortByValue: 'Trier par valeur',
        sortByName: 'Trier par nom',
      },
      
      // Watch
      watch: {
        brand: 'Marque',
        model: 'Modèle',
        reference: 'Référence',
        serial: 'Numéro de série',
        purchasePrice: 'Prix d\'achat',
        purchaseDate: 'Date d\'achat',
        condition: 'État',
        boxPapers: 'Boîte et papiers',
        notes: 'Notes',
        visibility: 'Visibilité',
        private: 'Privé',
        friends: 'Amis',
        public: 'Public',
        addPhoto: 'Ajouter une photo',
        setAsCover: 'Définir comme couverture',
        estimatedValue: 'Valeur estimée',
        profitLoss: 'Plus/Moins-value',
      },
      
      // Maintenance
      maintenance: {
        title: 'Entretien',
        serviceHistory: 'Historique des services',
        nextService: 'Prochain service',
        addService: 'Ajouter un service',
        serviceType: 'Type de service',
        serviceDate: 'Date du service',
        serviceCost: 'Coût du service',
        workshop: 'Atelier',
        serviceNotes: 'Notes du service',
        serviceInterval: 'Intervalle de service',
        months: 'mois',
        dueDate: 'Date d\'échéance',
        overdue: 'En retard',
        upcoming: 'À venir',
      },
      
      // Dashboard
      dashboard: {
        title: 'Tableau de bord',
        collectionOverview: 'Aperçu de la collection',
        valueEvolution: 'Évolution de la valeur',
        brandBreakdown: 'Répartition par marque',
        recentActivity: 'Activité récente',
        valueChange: 'Variation de valeur',
        last30Days: '30 derniers jours',
        last180Days: '180 derniers jours',
        totalWatches: 'Total des montres',
        averageValue: 'Valeur moyenne',
        highestValue: 'Valeur la plus élevée',
        lowestValue: 'Valeur la plus basse',
      },
      
      // Alerts
      alerts: {
        title: 'Alertes de prix',
        addAlert: 'Ajouter une alerte',
        editAlert: 'Modifier l\'alerte',
        deleteAlert: 'Supprimer l\'alerte',
        alertType: 'Type d\'alerte',
        above: 'Au-dessus de',
        below: 'En-dessous de',
        delta: 'Variation de',
        threshold: 'Seuil',
        active: 'Active',
        inactive: 'Inactive',
        triggered: 'Déclenchée',
        lastTriggered: 'Dernière déclenchement',
        noAlerts: 'Aucune alerte configurée',
      },
      
      // Social
      social: {
        title: 'Social',
        friends: 'Amis',
        addFriend: 'Ajouter un ami',
        friendRequests: 'Demandes d\'ami',
        accept: 'Accepter',
        decline: 'Refuser',
        remove: 'Retirer',
        publicProfiles: 'Profils publics',
        follow: 'Suivre',
        unfollow: 'Ne plus suivre',
        shareProfile: 'Partager le profil',
        shareLink: 'Lien de partage',
        copied: 'Lien copié !',
      },
      
      // Settings
      settings: {
        title: 'Paramètres',
        language: 'Langue',
        notifications: 'Notifications',
        pushNotifications: 'Notifications push',
        emailNotifications: 'Notifications email',
        privacy: 'Confidentialité',
        publicProfile: 'Profil public',
        dataExport: 'Export des données',
        exportCSV: 'Exporter en CSV',
        exportPDF: 'Exporter en PDF',
        account: 'Compte',
        deleteAccount: 'Supprimer le compte',
        signOut: 'Se déconnecter',
        about: 'À propos',
        version: 'Version',
        termsOfService: 'Conditions d\'utilisation',
        privacyPolicy: 'Politique de confidentialité',
      },
      
      // Paywall
      paywall: {
        title: 'Passez à Premium',
        subtitle: 'Débloquez toutes les fonctionnalités',
        free: 'Gratuit',
        premium: 'Premium',
        monthly: '{{price}}€/mois',
        features: {
          unlimitedWatches: 'Montres illimitées',
          unlimitedAlerts: 'Alertes illimitées',
          maintenanceTracking: 'Suivi d\'entretien complet',
          pdfExport: 'Export PDF',
          csvExport: 'Export CSV',
          advancedAnalytics: 'Analyses avancées',
          advancedSharing: 'Partage avancé',
        },
        currentPlan: 'Plan actuel',
        upgrade: 'Passer à Premium',
        restore: 'Restaurer les achats',
        terms: 'En continuant, vous acceptez nos conditions d\'utilisation',
        cancelAnytime: 'Annulable à tout moment',
        testimonials: 'Témoignages',
        guarantee: 'Garantie de satisfaction',
      },

      // Badges
      badges: {
        title: 'Mes Badges',
        unlocked: 'Débloqués',
        completion: 'Complétion',
        empty: {
          title: 'Aucun badge débloqué',
          subtitle: 'Ajoutez des montres à votre collection pour débloquer des badges !'
        },
        footer: 'Continuez à enrichir votre collection pour débloquer plus de badges !',
      },

      'badge.category': {
        achievement: 'Réalisations',
        collection: 'Collection',
        social: 'Social',
        premium: 'Premium',
      },

      // Timeline
      timeline: {
        title: 'Timeline',
        subtitle: 'Votre collection dans le temps',
        totalWatches: 'Total montres',
        years: 'Années',
        watches: 'montres',
        empty: {
          title: 'Aucune montre dans la timeline',
          subtitle: 'Ajoutez des montres avec des dates d\'achat pour voir votre timeline'
        },
        footer: 'Votre collection évolue dans le temps, gardez une trace de chaque acquisition !',
      },

      // Leaderboard
      leaderboard: {
        title: 'Classement',
        subtitle: 'Comparez-vous à vos amis',
        watches: 'montres',
        badges: 'badges',
        empty: {
          title: 'Aucun ami dans le classement',
          subtitle: 'Ajoutez des amis pour comparer vos collections !'
        },
        metrics: {
          value: 'Valeur',
          count: 'Nombre',
          vintage: 'Vintage',
          sport: 'Sport',
          badges: 'Badges',
        },
      },
    },
  },
  
  en: {
    translation: {
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        done: 'Done',
        retry: 'Retry',
      },
      
      // Auth
      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        noAccount: 'No account?',
        hasAccount: 'Already have an account?',
        signInWithGoogle: 'Sign in with Google',
        signInWithApple: 'Sign in with Apple',
        emailRequired: 'Email required',
        passwordRequired: 'Password required',
        invalidEmail: 'Invalid email',
        passwordTooShort: 'Password too short',
      },
      
      // Onboarding
      onboarding: {
        welcome: 'Welcome to Watch Collector',
        chooseLanguage: 'Choose your language',
        setPseudo: 'Choose your username',
        pseudoRequired: 'Username required',
        pseudoUnique: 'This username is already taken',
        publicProfile: 'Public profile',
        publicProfileDesc: 'Allow others to see your collection',
        privateProfile: 'Private profile',
        privateProfileDesc: 'Keep your collection private',
        start: 'Get Started',
      },
      
      // Collection
      collection: {
        title: 'My Collection',
        empty: 'No watches in your collection',
        addFirst: 'Add your first watch',
        addWatch: 'Add Watch',
        totalWatches: '{{count}} watch',
        totalWatches_plural: '{{count}} watches',
        totalValue: 'Total Value',
        searchPlaceholder: 'Search by brand, model...',
        filterByBrand: 'Filter by brand',
        filterByCondition: 'Filter by condition',
        sortByDate: 'Sort by date',
        sortByValue: 'Sort by value',
        sortByName: 'Sort by name',
      },
      
      // Watch
      watch: {
        brand: 'Brand',
        model: 'Model',
        reference: 'Reference',
        serial: 'Serial Number',
        purchasePrice: 'Purchase Price',
        purchaseDate: 'Purchase Date',
        condition: 'Condition',
        boxPapers: 'Box & Papers',
        notes: 'Notes',
        visibility: 'Visibility',
        private: 'Private',
        friends: 'Friends',
        public: 'Public',
        addPhoto: 'Add Photo',
        setAsCover: 'Set as Cover',
        estimatedValue: 'Estimated Value',
        profitLoss: 'Profit/Loss',
      },
      
      // Maintenance
      maintenance: {
        title: 'Maintenance',
        serviceHistory: 'Service History',
        nextService: 'Next Service',
        addService: 'Add Service',
        serviceType: 'Service Type',
        serviceDate: 'Service Date',
        serviceCost: 'Service Cost',
        workshop: 'Workshop',
        serviceNotes: 'Service Notes',
        serviceInterval: 'Service Interval',
        months: 'months',
        dueDate: 'Due Date',
        overdue: 'Overdue',
        upcoming: 'Upcoming',
      },
      
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        collectionOverview: 'Collection Overview',
        valueEvolution: 'Value Evolution',
        brandBreakdown: 'Brand Breakdown',
        recentActivity: 'Recent Activity',
        valueChange: 'Value Change',
        last30Days: 'Last 30 days',
        last180Days: 'Last 180 days',
        totalWatches: 'Total Watches',
        averageValue: 'Average Value',
        highestValue: 'Highest Value',
        lowestValue: 'Lowest Value',
      },
      
      // Alerts
      alerts: {
        title: 'Price Alerts',
        addAlert: 'Add Alert',
        editAlert: 'Edit Alert',
        deleteAlert: 'Delete Alert',
        alertType: 'Alert Type',
        above: 'Above',
        below: 'Below',
        delta: 'Delta',
        threshold: 'Threshold',
        active: 'Active',
        inactive: 'Inactive',
        triggered: 'Triggered',
        lastTriggered: 'Last Triggered',
        noAlerts: 'No alerts configured',
      },
      
      // Social
      social: {
        title: 'Social',
        friends: 'Friends',
        addFriend: 'Add Friend',
        friendRequests: 'Friend Requests',
        accept: 'Accept',
        decline: 'Decline',
        remove: 'Remove',
        publicProfiles: 'Public Profiles',
        follow: 'Follow',
        unfollow: 'Unfollow',
        shareProfile: 'Share Profile',
        shareLink: 'Share Link',
        copied: 'Link copied!',
      },
      
      // Settings
      settings: {
        title: 'Settings',
        language: 'Language',
        notifications: 'Notifications',
        pushNotifications: 'Push Notifications',
        emailNotifications: 'Email Notifications',
        privacy: 'Privacy',
        publicProfile: 'Public Profile',
        dataExport: 'Data Export',
        exportCSV: 'Export to CSV',
        exportPDF: 'Export to PDF',
        account: 'Account',
        deleteAccount: 'Delete Account',
        signOut: 'Sign Out',
        about: 'About',
        version: 'Version',
        termsOfService: 'Terms of Service',
        privacyPolicy: 'Privacy Policy',
      },
      
      // Paywall
      paywall: {
        title: 'Upgrade to Premium',
        subtitle: 'Unlock all features',
        free: 'Free',
        premium: 'Premium',
        monthly: '€{{price}}/month',
        features: {
          unlimitedWatches: 'Unlimited watches',
          unlimitedAlerts: 'Unlimited alerts',
          maintenanceTracking: 'Complete maintenance tracking',
          pdfExport: 'PDF export',
          csvExport: 'CSV export',
          advancedAnalytics: 'Advanced analytics',
          advancedSharing: 'Advanced sharing',
        },
        currentPlan: 'Current Plan',
        upgrade: 'Upgrade to Premium',
        restore: 'Restore Purchases',
        terms: 'By continuing, you agree to our terms of service',
        cancelAnytime: 'Cancel anytime',
        testimonials: 'Testimonials',
        guarantee: 'Satisfaction guarantee',
      },

      // Badges
      badges: {
        title: 'My Badges',
        unlocked: 'Unlocked',
        completion: 'Completion',
        empty: {
          title: 'No badges unlocked',
          subtitle: 'Add watches to your collection to unlock badges!'
        },
        footer: 'Keep enriching your collection to unlock more badges!',
      },

      'badge.category': {
        achievement: 'Achievements',
        collection: 'Collection',
        social: 'Social',
        premium: 'Premium',
      },

      // Timeline
      timeline: {
        title: 'Timeline',
        subtitle: 'Your collection over time',
        totalWatches: 'Total watches',
        years: 'Years',
        watches: 'watches',
        empty: {
          title: 'No watches in timeline',
          subtitle: 'Add watches with purchase dates to see your timeline'
        },
        footer: 'Your collection evolves over time, keep track of every acquisition!',
      },

      // Leaderboard
      leaderboard: {
        title: 'Leaderboard',
        subtitle: 'Compare yourself to your friends',
        watches: 'watches',
        badges: 'badges',
        empty: {
          title: 'No friends in leaderboard',
          subtitle: 'Add friends to compare your collections!'
        },
        metrics: {
          value: 'Value',
          count: 'Count',
          vintage: 'Vintage',
          sport: 'Sport',
          badges: 'Badges',
        },
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
