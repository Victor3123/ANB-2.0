import {AlphabeticalSystem, LanguageCode, Country} from './localisation';

export interface Language {
  code: LanguageCode;
  country: Country;
  alphabeticalSystem: AlphabeticalSystem;
}
