import type { StructuredCourses } from "@/types/course";
import { getFamily } from "./layout";

const SPECIFIC_BASE_PALETTES = [
  {
    name: "blue",
    shades: ["#dbeafe", "#bfdbfe", "#93c5fd"],
  },
  {
    name: "blue-dark",
    shades: ["#93c5fd", "#60a5fa", "#3b82f6"],
  },
] as const;

const SPECIFIC_TECH_PALETTES = [
  {
    name: "purple",
    shades: ["#e9d5ff", "#d8b4fe", "#c084fc"],
  },
  {
    name: "purple-dark",
    shades: ["#c084fc", "#a855f7", "#9333ea"],
  },
] as const;

const TECH_FAMILY_PATTERN = /\b(code|coding|program|programming|web|dev|development|data|ai|ml|ux|ui|design|system|software|engineer|technical|tech|motion|3d|game|app|script)\b/i;

const NONSPECIFIC_ORANGE_SHADES = [
  { category: "nonspecific-orange-1", color: "#ffedd5" },
  { category: "nonspecific-orange-2", color: "#fed7aa" },
  { category: "nonspecific-orange-3", color: "#fdba74" },
  { category: "nonspecific-orange-4", color: "#fb923c" },
] as const;

export function assignColors(
  courses: StructuredCourses
): Record<string, { color: string; category: string }> {
  const allFamilies = courses.map((course) => getFamily(course.course_name));
  const families = Array.from(new Set(allFamilies));
  const technicalFamilies = families.filter((family) => TECH_FAMILY_PATTERN.test(family));
  const regularFamilies = families.filter((family) => !TECH_FAMILY_PATTERN.test(family));

  const paletteByFamily: Record<string, { name: string; shades: readonly string[] }> = {};
  regularFamilies.forEach((family, index) => {
    paletteByFamily[family] = SPECIFIC_BASE_PALETTES[index % SPECIFIC_BASE_PALETTES.length];
  });
  technicalFamilies.forEach((family, index) => {
    paletteByFamily[family] = SPECIFIC_TECH_PALETTES[index % SPECIFIC_TECH_PALETTES.length];
  });
  const nonSpecificToneByFamily = Object.fromEntries(
    families.map((family, index) => [family, NONSPECIFIC_ORANGE_SHADES[index % NONSPECIFIC_ORANGE_SHADES.length]])
  ) as Record<string, (typeof NONSPECIFIC_ORANGE_SHADES)[number]>;
  const shadeIdx: Record<string, number> = {};
  const colorMap: Record<string, { color: string; category: string }> = {};

  courses.forEach((course) => {
    if (colorMap[course.course_name]) return;

    const loweredName = course.course_name.toLowerCase();
    // Keep electives and "with" variants visually neutral.
    if (loweredName.includes("keuzevak") || loweredName.includes("with")) {
      colorMap[course.course_name] = {
        color: "#e5e7eb",
        category: "light-grey",
      };
      return;
    }

    // Non-specific courses use one fixed orange shade per family.
    if ((course.study_programs?.length ?? 0) !== 1) {
      const fam = getFamily(course.course_name);
      const tone = nonSpecificToneByFamily[fam] ?? NONSPECIFIC_ORANGE_SHADES[0];
      colorMap[course.course_name] = {
        color: tone.color,
        category: tone.category,
      };
      return;
    }

    const fam = getFamily(course.course_name);
    const palette = paletteByFamily[fam] ?? SPECIFIC_BASE_PALETTES[0];
    const idx = (shadeIdx[fam] ?? 0) % palette.shades.length;
    shadeIdx[fam] = (shadeIdx[fam] ?? 0) + 1;
    colorMap[course.course_name] = {
      color: palette.shades[idx],
      category: palette.name,
    };
  });
 
  return colorMap;
}
