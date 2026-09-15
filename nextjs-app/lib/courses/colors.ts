import type { StructuredCourses } from "@/types/course";
import { getFamily } from "./layout";

// One category per family keeps every similarly-named course (same family, e.g.
// "Interaction 1" / "Interaction 2") on the exact same shade. All specific
// (single-programme) families share one hue and only vary by shade; generic
// (multi-programme) families get their own hue, also varied by shade.
const SPECIFIC_CATEGORIES = [
  "specific-1",
  "specific-2",
  "specific-3",
  "specific-4",
  "specific-5",
  "specific-6",
] as const;
const NONSPECIFIC_CATEGORIES = [
  "nonspecific-orange-1",
  "nonspecific-orange-2",
  "nonspecific-orange-3",
  "nonspecific-orange-4",
] as const;

const CATEGORY_SWATCH: Record<string, string> = {
  "specific-1": "#dbeafe",
  "specific-2": "#bfdbfe",
  "specific-3": "#93c5fd",
  "specific-4": "#60a5fa",
  "specific-5": "#3b82f6",
  "specific-6": "#1d4ed8",
  "nonspecific-orange-1": "#fed7aa",
  "nonspecific-orange-2": "#fdba74",
  "nonspecific-orange-3": "#fb923c",
  "nonspecific-orange-4": "#f97316",
};

export function assignColors(
  courses: StructuredCourses
): Record<string, { color: string; category: string }> {
  const allFamilies = courses.map((course) => getFamily(course.course_name));
  const families = Array.from(new Set(allFamilies));

  // Every course in a family shares one category, so similarly-named courses
  // (e.g. "Interaction 1" / "Interaction 2") always render the same shade.
  const specificCategoryByFamily = Object.fromEntries(
    families.map((family, index) => [family, SPECIFIC_CATEGORIES[index % SPECIFIC_CATEGORIES.length]])
  ) as Record<string, (typeof SPECIFIC_CATEGORIES)[number]>;

  // Generic (multi-programme) families get a different shade per family so they
  // stay distinguishable from each other, while still sharing the orange hue.
  const genericCategoryByFamily = Object.fromEntries(
    families.map((family, index) => [family, NONSPECIFIC_CATEGORIES[index % NONSPECIFIC_CATEGORIES.length]])
  ) as Record<string, (typeof NONSPECIFIC_CATEGORIES)[number]>;

  const colorMap: Record<string, { color: string; category: string }> = {};

  courses.forEach((course) => {
    if (colorMap[course.course_name]) return;

    const fam = getFamily(course.course_name);

    // Non-specific (generic) courses use one fixed shade per family, from the orange family.
    // Keuzevakken (electives) are generic by nature (course.is_generic covers them
    // via the name-based check in buildStructuredCourses).
    if (course.is_generic) {
      const category = genericCategoryByFamily[fam] ?? NONSPECIFIC_CATEGORIES[0];
      colorMap[course.course_name] = {
        color: CATEGORY_SWATCH[category],
        category,
      };
      return;
    }

    const category = specificCategoryByFamily[fam] ?? SPECIFIC_CATEGORIES[0];
    colorMap[course.course_name] = {
      color: CATEGORY_SWATCH[category],
      category,
    };
  });

  return colorMap;
}
