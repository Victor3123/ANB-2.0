import {Language} from '../../types/Language.type';
import {LanguageCode, AlphabeticalSystem, Country} from '../../types/localisation';

export const UK: Language = {
  code: <LanguageCode>'uk',
  country: <Country>'Ukraine',
  alphabeticalSystem: <AlphabeticalSystem>'cyrillic',
}

export const EN: Language = {
  code: <LanguageCode>'en',
  country: <Country>'England',
  alphabeticalSystem: <AlphabeticalSystem>'latin',
}
