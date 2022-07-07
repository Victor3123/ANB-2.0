import {ILanguage} from '../../interfaces/Language.interface';
import {LanguageCode, AlphabeticalSystem, Country} from '../../types/localisation';

export const UK: ILanguage = {
  code: <LanguageCode>'uk',
  country: <Country>'Ukraine',
  alphabeticalSystem: <AlphabeticalSystem>'cyrillic',
}

export const EN: ILanguage = {
  code: <LanguageCode>'en',
  country: <Country>'England',
  alphabeticalSystem: <AlphabeticalSystem>'latin',
}
