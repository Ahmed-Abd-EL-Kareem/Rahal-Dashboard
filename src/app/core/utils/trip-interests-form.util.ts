import { FormGroup } from '@angular/forms';
import {
  TRIP_CATEGORY_OPTIONS,
  TRIP_PREDEFINED_CATEGORIES,
  buildInterestsFromForm,
  parseInterestsToForm,
} from './trip-interests.util';

export { TRIP_CATEGORY_OPTIONS, TRIP_PREDEFINED_CATEGORIES };

export function createInterestsFormFields(): {
  category: string;
  otherInterest: string;
} {
  return {
    category: '',
    otherInterest: '',
  };
}

export function patchInterestsForm(
  form: FormGroup,
  interests?: string[] | null
): void {
  const parsed = parseInterestsToForm(interests);
  form.patchValue({
    category: parsed.category,
    otherInterest: parsed.otherInterest,
  });
}

export function getInterestsFromForm(formValue: {
  category?: string;
  otherInterest?: string;
}): string[] {
  return buildInterestsFromForm(
    formValue.category ?? '',
    formValue.otherInterest
  );
}
