export const TRIP_PREDEFINED_CATEGORIES = ['Family', 'Luxury', 'Adventure', 'Weekend'] as const;
export type TripPredefinedCategory = (typeof TRIP_PREDEFINED_CATEGORIES)[number];
export const TRIP_CATEGORY_OPTIONS = [...TRIP_PREDEFINED_CATEGORIES, 'Other'] as const;
export type TripCategoryOption = (typeof TRIP_CATEGORY_OPTIONS)[number];

const CATEGORY_ALIASES: Record<string, TripPredefinedCategory> = {
  famaily: 'Family',
  family: 'Family',
  luxury: 'Luxury',
  adventure: 'Adventure',
  weekend: 'Weekend',
};

export function normalizeInterest(value: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const alias = CATEGORY_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;

  const predefined = TRIP_PREDEFINED_CATEGORIES.find(
    (category) => category.toLowerCase() === trimmed.toLowerCase()
  );
  if (predefined) return predefined;

  return trimmed;
}

export function normalizeInterests(interests?: string[] | null): string[] {
  if (!interests?.length) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of interests) {
    const normalized = normalizeInterest(raw);
    if (!normalized) continue;

    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(normalized);
  }

  return result;
}

export function parseInterestsToForm(interests?: string[] | null): {
  category: string;
  otherInterest: string;
} {
  const normalized = normalizeInterests(interests);
  if (!normalized.length) {
    return { category: '', otherInterest: '' };
  }

  for (const category of TRIP_PREDEFINED_CATEGORIES) {
    if (normalized.includes(category)) {
      return { category, otherInterest: '' };
    }
  }

  const custom = normalized.find(
    (interest) =>
      !TRIP_PREDEFINED_CATEGORIES.includes(interest as TripPredefinedCategory)
  );

  return {
    category: 'Other',
    otherInterest: custom ?? normalized[0] ?? '',
  };
}

export function buildInterestsFromForm(
  category: string,
  otherInterest?: string
): string[] {
  if (!category) return [];

  if (category === 'Other') {
    const custom = otherInterest?.trim();
    if (!custom) return [];

    const normalized = normalizeInterest(custom);
    return normalized ? [normalized] : [];
  }

  const normalized = normalizeInterest(category);
  return normalized ? [normalized] : [];
}

export function interestMatchesCategory(interest: string, category: string): boolean {
  const normalizedInterest = normalizeInterest(interest);
  const normalizedCategory = normalizeInterest(category);
  return !!normalizedInterest && normalizedInterest === normalizedCategory;
}
