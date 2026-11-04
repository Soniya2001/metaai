import React from 'react';
import { SupportedLanguage } from '../../types';
import { Check } from 'lucide-react';

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  label?: string;
  description?: string;
}

export const supportedLanguages: { name: SupportedLanguage; script: string; region: string }[] = [
  { name: 'English', script: 'English', region: 'Global / India' },
  { name: 'Tamil', script: 'தமிழ்', region: 'Tamil Nadu, Sri Lanka' },
  { name: 'Hindi', script: 'हिन्दी', region: 'Northern / Central India' },
  { name: 'Telugu', script: 'తెలుగు', region: 'Andhra Pradesh, Telangana' },
  { name: 'Kannada', script: 'ಕನ್ನಡ', region: 'Karnataka' },
  { name: 'Malayalam', script: 'മലയാളം', region: 'Kerala' },
  { name: 'Bengali', script: 'বাংলা', region: 'West Bengal, Bangladesh' },
  { name: 'Marathi', script: 'मराठी', region: 'Maharashtra' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  label = 'Preferred Translation Language',
  description = 'Voice notes received in other languages will be automatically transcribed and synthesized into this language.',
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-semibold text-primary-text block">{label}</label>
        {description && (
          <p className="text-xs text-muted-text mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {supportedLanguages.map(lang => {
          const isSelected = lang.name === value;
          return (
            <button
              key={lang.name}
              type="button"
              onClick={() => onChange(lang.name)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-accent bg-accent-subtle/60 text-primary-text ring-1 ring-accent/30 shadow-subtle'
                  : 'border-border bg-surface hover:bg-surface-subtle text-primary-text'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  {lang.name}
                  <span className="font-normal text-muted-text text-xs">({lang.script})</span>
                </span>
                <span className="text-[11px] text-muted-text">{lang.region}</span>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
