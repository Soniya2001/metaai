import { SupportedLanguage } from '../types';

// Multi-language sample translations for the demo conversations
export const translationBank: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  // Ananya's Tamil message: "நான் 7 மணிக்குள்ள வீட்டுக்கு வந்துடுவேன். சீக்கிரம் பார்க்கலாம்!"
  'voice-ananya-4': {
    English: "I'll reach home by 7 PM. See you soon!",
    Hindi: "मैं शाम 7 बजे तक घर पहुँच जाऊँगी। जल्द मिलते हैं!",
    Tamil: "நான் 7 மணிக்குள்ள வீட்டுக்கு வந்துடுவேன். சீக்கிரம் பார்க்கலாம்!",
    Telugu: "నేను సాయంత్రం 7 గంటలకు ఇంటికి చేరుకుంటాను. త్వరలోనే కలుద్దాం!",
    Kannada: "ನಾನು ಸಂಜೆ 7 ಗಂಟೆಯೊಳಗೆ ಮನೆ ತಲುಪುತ್ತೇನೆ. ಶೀಘ್ರದಲ್ಲೇ ಭೇಟಿಯಾಗೋಣ!",
    Malayalam: "ഞാൻ വൈകുന്നേരം 7 മണിയോടെ വീട്ടിലെത്തും. ഉടൻ കാണാം!",
    Bengali: "আমি সন্ধ্যা ৭টার মধ্যে বাড়ি পৌঁছে যাব। শীঘ্রই দেখা হবে!",
    Marathi: "मी संध्याकाळी ७ वाजेपर्यंत घरी पोहोचेन. लवकरच भेटू!",
  },
  // Rahul's Hindi message: "कल सुबह 10 बजे हमारी क्लाइंट के साथ डेमो मीटिंग है, याद रखना।"
  'voice-rahul-3': {
    English: "Remember, we have our client demo meeting tomorrow at 10 AM.",
    Tamil: "நாளை காலை 10 மணிக்கு வாடிக்கையாளருடன் டெமோ மீட்டிங் உள்ளது, நினைவிருக்கட்டும்.",
    Hindi: "कल सुबह 10 बजे हमारी क्लाइंट के साथ डेमो मीटिंग है, याद रखना।",
    Telugu: "రేపు ఉదయం 10 గంటలకు క్లయింట్‌తో మన డెమో మీటింగ్ ఉంది, గుర్తుంచుకోండి.",
    Kannada: "ನಾಳೆ ಬೆಳಿಗ್ಗೆ 10 ಗಂಟೆಗೆ ಕ್ಲೈಂಟ್ ಜೊತೆ ಡೆಮೊ ಮೀಟಿಂಗ್ ಇದೆ, ನೆನಪಿರಲಿ.",
    Malayalam: "നാളെ രാവിലെ 10 മണിക്ക് ക്ലയന്റുമായി ഡെമോ മീറ്റിംഗ് ഉണ്ടെന്ന കാര്യം ഓർക്കുക.",
    Bengali: "আগামীকাল সকাল ১০টায় ক্লায়েন্টের সাথে আমাদের ডেমো মিটিং আছে, মনে রাখবেন।",
    Marathi: "उद्या सकाळी १० वाजता आपली क्लायंटसोबत डेमो मिटिंग आहे, लक्षात ठेवा.",
  },
  // Mom's Telugu message: "నువ్వు ఈరోజు సమయానికి భోజనం చేశావా? రాత్రికి త్వరగా పడుకో నాన్నా."
  'voice-mom-2': {
    English: "Did you have lunch on time today? Go to sleep early tonight, dear.",
    Tamil: "இன்று சரியான நேரத்தில் சாப்பிட்டாயா? இரவு சீக்கிரம் தூங்கு கண்ணா.",
    Hindi: "क्या तुमने आज समय पर खाना खाया? रात को जल्दी सो जाना बेटा।",
    Telugu: "నువ్వు ఈరోజు సమయానికి భోజనం చేశావా? రాత్రికి త్వరగా పడుకో నాన్నా.",
    Kannada: "ಇವತ್ತು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಊಟ ಮಾಡಿದಿರಾ? ರಾತ್ರಿ ಬೇಗ ಮಲಗು ಕಂದ.",
    Malayalam: "ഇന്ന് കൃത്യസമയത്ത് ഭക്ഷണം കഴിച്ചോ? രാത്രി നേരത്തെ ഉറങ്ങണം മോളെ/മോനെ.",
    Bengali: "তুমি কি আজকে ঠিক সময়ে খেয়েছিলে? রাতে তাড়াতাড়ি ঘুমিয়ে পড়ো সোনা।",
    Marathi: "आज वेळेवर जेवलास का? रात्री लवकर झोप बाळा.",
  },
  // Arjun's Bengali message: "আপনার পিচ ডেকটি চমৎকার লেগেছে। আসুন শুক্রবার বিস্তারিত আলোচনা করি।"
  'voice-arjun-1': {
    English: "I found your pitch deck impressive. Let us discuss the details this Friday.",
    Tamil: "உங்கள் பிட்ச் டெக் சிறப்பாக இருந்தது. வரும் வெள்ளிக்கிழமை விரிவாக விவாதிப்போம்.",
    Hindi: "आपकी पिच डेक बहुत प्रभावशाली लगी। आइए इस शुक्रवार विस्तार से चर्चा करते हैं।",
    Telugu: "మీ పిచ్ డెక్ చాలా ఆకట్టుకుంది. ఈ శుక్రవారం వివరాలు చర్చిద్దాం.",
    Kannada: "ನಿಮ್ಮ ಪಿಚ್ ಡೆಕ್ ಅದ್ಭುತವಾಗಿದೆ. ಈ ಶುಕ್ರವಾರ ವಿವರವಾಗಿ ಚರ್ಚಿಸೋಣ.",
    Malayalam: "നിങ്ങളുടെ പിച്ച് ഡെക്ക് മികച്ചതായിരുന്നു. ഈ വെള്ളിയാഴ്ച വിശദമായി ചർച്ച ചെയ്യാം.",
    Bengali: "আপনার পিচ ডেকটি চমৎকার লেগেছে। আসুন শুক্রবার বিস্তারিত আলোচনা করি।",
    Marathi: "तुमचा पिच डेक खूप आवडला. या शुक्रवारी सविस्तर चर्चा करूया.",
  },
};

export async function simulateTranslation(
  voiceId: string,
  targetLanguage: SupportedLanguage,
  fallbackText: string = ''
): Promise<{ translatedText: string; success: boolean }> {
  // Simulate realistic network & inference delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (translationBank[voiceId] && translationBank[voiceId][targetLanguage]) {
    return {
      translatedText: translationBank[voiceId][targetLanguage]!,
      success: true,
    };
  }

  // Generative fallback for dynamic voice messages
  const sampleTranslations: Record<SupportedLanguage, string> = {
    English: fallbackText || 'Voice message translated into English.',
    Tamil: 'குரல் செய்தி தமிழில் மொழிபெயர்க்கப்பட்டது: ' + (fallbackText || 'வணக்கம்! நலமா?'),
    Hindi: 'आवाज संदेश हिंदी में अनुवादित: ' + (fallbackText || 'नमस्ते! क्या हाल है?'),
    Telugu: 'వాయిస్ సందేశం తెలుగులోకి అనువదించబడింది: ' + (fallbackText || 'నమస్కారం! బాగున్నారా?'),
    Kannada: 'ಧ್ವನಿ ಸಂದೇಶ ಕನ್ನಡಕ್ಕೆ ಅನುವಾದಗೊಂಡಿದೆ: ' + (fallbackText || 'ನಮಸ್ಕಾರ! ಹೇಗಿದ್ದೀರಾ?'),
    Malayalam: 'ശബ്ദ സന്ദേശം മലയാളത്തിലേക്ക് വിവർത്തനം ചെയ്തു: ' + (fallbackText || 'നമസ്കാരം! സുഖമാണോ?'),
    Bengali: 'ভয়েস বার্তা বাংলায় অনূদিত: ' + (fallbackText || 'নমস্কার! কেমন আছেন?'),
    Marathi: 'व्हॉइस मेसेज मराठीत भाषांतरित: ' + (fallbackText || 'नमस्कार! कसे आहात?'),
  };

  return {
    translatedText: sampleTranslations[targetLanguage] || fallbackText,
    success: true,
  };
}

