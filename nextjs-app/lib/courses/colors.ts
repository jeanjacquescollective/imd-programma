import type { StructuredCourses } from "@/types/course";
import { getFamily } from "./layout";

const PALETTES = [
  {
    name: "green",
    shades: ["#c8f5c4", "#a5e8a0", "#7dd87a"],
  },
  {
    name: "green-dark",
    shades: ["#a5e8a0", "#7dd87a", "#58c754"],
  },
  {
    name: "blue",
    shades: ["#b3d9ff", "#85bef5", "#5b9bd5"],
  },
  {
    name: "blue-dark",
    shades: ["#8cc0ee", "#5b9bd5", "#3d7fc0"],
  },
  {
    name: "purple",
    shades: ["#e0b8f0", "#ce93d8", "#ba68c8"],
  },
  {
    name: "purple-dark",
    shades: ["#d3a8e3", "#ba68c8", "#9c45b8"],
  },
  {
    name: "teal",
    shades: ["#c8f0ec", "#9dddd6", "#80cbc4"],
  },
  {
    name: "teal-dark",
    shades: ["#aee0db", "#80cbc4", "#55b5ac"],
  },
] as const;

const NONSPECIFIC_BLUE_SHADES = [
  { category: "nonspecific-blue-1", color: "#dbeafe" },
  { category: "nonspecific-blue-2", color: "#bfdbfe" },
  { category: "nonspecific-blue-3", color: "#93c5fd" },
  { category: "nonspecific-blue-4", color: "#60a5fa" },
] as const;

export function assignColors(
  courses: StructuredCourses
): Record<string, { color: string; category: string }> {
  const allFamilies = courses.map((course) => getFamily(course.course_name));
  const families = Array.from(new Set(allFamilies));
  const paletteByFamily = Object.fromEntries(
    families.map((family, index) => [family, PALETTES[index % PALETTES.length]])
  );
  const shadeIdx: Record<string, number> = {};
  const nonSpecificShadeIdx: Record<string, number> = {};
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

    // Non-specific courses use blue shades only (same rule as layout: length !== 1).
    if ((course.study_programs?.length ?? 0) !== 1) {
      const fam = getFamily(course.course_name);
      const idx = (nonSpecificShadeIdx[fam] ?? 0) % NONSPECIFIC_BLUE_SHADES.length;
      nonSpecificShadeIdx[fam] = (nonSpecificShadeIdx[fam] ?? 0) + 1;
      const tone = NONSPECIFIC_BLUE_SHADES[idx];
      colorMap[course.course_name] = {
        color: tone.color,
        category: tone.category,
      };
      return;
    }

    const fam = getFamily(course.course_name);
    const palette = paletteByFamily[fam] ?? PALETTES[0];
    const idx = (shadeIdx[fam] ?? 0) % palette.shades.length;
    shadeIdx[fam] = (shadeIdx[fam] ?? 0) + 1;
    colorMap[course.course_name] = {
      color: palette.shades[idx],
      category: palette.name,
    };
  });

  return colorMap;
}
