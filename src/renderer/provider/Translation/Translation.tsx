import { ReactNode, useMemo } from 'react';
import type { Language } from '../../../../locales';
import TranslationContext from './TranslationContext';
import useLocalState from '../../hooks/useLocalState';

export default function Translation({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useLocalState<Language>(
    'language',
    getDefaultLanguage(),
  );

  const contextValue = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

function getDefaultLanguage() {
  const userLanguage = window.navigator.language.toLowerCase();

  if (userLanguage === 'zh-tw' || userLanguage === 'zh_TW') {
    return 'zh_tw';
  }
  if (userLanguage === 'zh-cn' || userLanguage === 'zh_CN') {
    return 'zh_cn';
  }
  if (userLanguage === 'ja' || userLanguage.startsWith('ja')) {
    return 'jp'; // For Japanese
  }
  if (userLanguage === 'fr' || userLanguage.startsWith('fr')) {
    return 'fr'; // For French
  }
  return 'en'; // Default to English
}
