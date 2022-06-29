import {AlphabeticalSystem, LanguageCode, Country} from '../types/localisation';

export interface ILanguage {
  code: LanguageCode;
  country: Country;
  alphabeticalSystem: AlphabeticalSystem;
}
