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
          },
          "dashboard": {
            "title": "Dashboard",
            "welcome_back": "Welcome back",
            "career_tools": "Career Tools",
            "recommended_colleges": "Recommended Colleges",
            "recommended_courses": "Recommended Courses",
            "take_quiz": "Take Aptitude Test",
            "view_all": "View All",
            "quick_actions": "Quick Actions",
            "your_progress": "Your Progress"
          },
          "profile": {
            "title": "Profile & Settings",
            "edit": "Edit Profile",
            "save": "Save",
            "cancel": "Cancel",
            "change_picture": "Change Picture",
            "remove_picture": "Remove",
            "full_name": "Full Name",
            "email": "Email",
            "age": "Age",
            "education_level": "Education Level",
            "class_level": "Current Class/Level",
            "study_area": "Area of Study",
            "goals": "Goals",
            "saved_items": "Saved Items",
            "history": "History",
            "settings": "Settings"
          },
          "quiz": {
            "title": "Career Aptitude Assessment",
            "start": "Start Assessment",
            "next": "Next Question",
            "submit": "Submit",
            "results": "Your Results",
            "score": "Score",
            "recommendations": "Recommendations",
            "retake": "Retake Quiz"
          },
          "career_gps": {
            "title": "Career GPS",
            "search_placeholder": "Search for a career...",
            "roadmap": "Career Roadmap",
            "skill_gap": "Skill Gap Analysis",
            "no_results": "No roadmap found"
          },
          "study_materials": {
            "title": "Free Study Materials",
            "search": "Search resources...",
            "youtube": "YouTube Channels",
            "courses": "Free Courses",
            "government": "Government Resources"
          },
          "typing_test": {
            "title": "Typing Speed Test",
            "speed_mode": "Speed Mode",
            "professional": "Professional Writing",
            "duration": "Test Duration",
            "wpm": "WPM",
            "accuracy": "Accuracy",
            "errors": "Errors",
            "start": "Start Test",
            "try_again": "Try Again"
          },
          "common": {
            "loading": "Loading...",
            "error": "Something went wrong",
            "retry": "Try Again",
            "back": "Back",
            "submit": "Submit",
            "search": "Search",
            "filter": "Filter",
            "clear": "Clear",
            "view_details": "View Details",
            "view_website": "View Website"
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
          },
          "dashboard": {
            "title": "डैशबोर्ड",
            "welcome_back": "वापस आपका स्वागत है",
            "career_tools": "करियर टूल्स",
            "recommended_colleges": "अनुशंसित कॉलेज",
            "recommended_courses": "अनुशंसित कोर्स",
            "take_quiz": "एप्टीट्यूड टेस्ट दें",
            "view_all": "सभी देखें",
            "quick_actions": "त्वरित कार्रवाई",
            "your_progress": "आपकी प्रगति"
          },
          "profile": {
            "title": "प्रोफ़ाइल और सेटिंग्स",
            "edit": "प्रोफ़ाइल संपादित करें",
            "save": "सहेजें",
            "cancel": "रद्द करें",
            "change_picture": "फोटो बदलें",
            "remove_picture": "हटाएं",
            "full_name": "पूरा नाम",
            "email": "ईमेल",
            "age": "उम्र",
            "education_level": "शिक्षा स्तर",
            "class_level": "वर्तमान कक्षा/स्तर",
            "study_area": "अध्ययन क्षेत्र",
            "goals": "लक्ष्य",
            "saved_items": "सहेजी गई चीजें",
            "history": "इतिहास",
            "settings": "सेटिंग्स"
          },
          "quiz": {
            "title": "करियर एप्टीट्यूड मूल्यांकन",
            "start": "मूल्यांकन शुरू करें",
            "next": "अगला प्रश्न",
            "submit": "जमा करें",
            "results": "आपके परिणाम",
            "score": "अंक",
            "recommendations": "अनुशंसाएं",
            "retake": "दोबारा परीक्षा दें"
          },
          "career_gps": {
            "title": "करियर GPS",
            "search_placeholder": "करियर खोजें...",
            "roadmap": "करियर रोडमैप",
            "skill_gap": "कौशल अंतर विश्लेषण",
            "no_results": "कोई रोडमैप नहीं मिला"
          },
          "study_materials": {
            "title": "मुफ़्त अध्ययन सामग्री",
            "search": "संसाधन खोजें...",
            "youtube": "YouTube चैनल",
            "courses": "मुफ़्त कोर्स",
            "government": "सरकारी संसाधन"
          },
          "typing_test": {
            "title": "टाइपिंग स्पीड टेस्ट",
            "speed_mode": "स्पीड मोड",
            "professional": "प्रोफेशनल लेखन",
            "duration": "टेस्ट अवधि",
            "wpm": "WPM",
            "accuracy": "सटीकता",
            "errors": "त्रुटियां",
            "start": "टेस्ट शुरू करें",
            "try_again": "फिर से कोशिश करें"
          },
          "common": {
            "loading": "लोड हो रहा है...",
            "error": "कुछ गलत हुआ",
            "retry": "फिर से कोशिश करें",
            "back": "वापस",
            "submit": "जमा करें",
            "search": "खोजें",
            "filter": "फ़िल्टर",
            "clear": "साफ़ करें",
            "view_details": "विवरण देखें",
            "view_website": "वेबसाइट देखें"
          }
        }
      }
    }
  });

export default i18n;
