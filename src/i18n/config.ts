import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          "nav": {
            "dashboard": "Dashboard",
            "ai_mentor": "AI Mentor",
            "careers": "Careers",
            "colleges": "Colleges",
            "scholarships": "Scholarships",
            "aptitude_test": "Aptitude Test",
            "mock_interview": "Mock Interview"
          },
          "onboarding": {
            "welcome": "Welcome to Avsar",
            "language_step": "Choose your preferred language",
            "language_sub": "Select how you'd like to interact with our AI career tools"
          }
        }
      },
      hi: {
        translation: {
          "nav": {
            "dashboard": "डैशबोर्ड",
            "ai_mentor": "AI मेंटर",
            "careers": "करियर",
            "colleges": "कॉलेज",
            "scholarships": "छात्रवृत्ति",
            "aptitude_test": "एप्टीट्यूड टेस्ट",
            "mock_interview": "मॉक इंटरव्यू"
          },
          "onboarding": {
            "welcome": "AVSAR में आपका स्वागत है",
            "language_step": "अपनी पसंदीदा भाषा चुनें",
            "language_sub": "चुनें कि आप हमारे AI करियर टूल्स के साथ कैसे बातचीत करना चाहेंगे"
          }
        }
      }
    }
  });

export default i18n;
