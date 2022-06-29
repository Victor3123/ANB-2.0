import {ILanguage} from '../../interfaces/Language.interface';
import {LanguageCode, AlphabeticalSystem, Country} from '../../types/localisation';

export const UA: ILanguage = {
  code: <LanguageCode>'ua',
  country: <Country>'Ukraine',
  alphabeticalSystem: <AlphabeticalSystem>'cyrillic',
}

export const EN: ILanguage = {
  code: <LanguageCode>'en',
  country: <Country>'England',
  alphabeticalSystem: <AlphabeticalSystem>'latin',
}
