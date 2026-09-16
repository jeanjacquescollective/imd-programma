import type { StructuredCourses } from "@/types/course";
import { getFamily } from "./layout";

export type PaletteEntry = { background: string; border: string; text: string; credit: string };

// One color scale per traject (study programme), so every programme reads as
// its own hue. Shared/generic courses (taught across more than one traject)
// always use the orange scale, regardless of which traject page they're being
// viewed from, so "general" courses are recognizable everywhere.
const SCALES = {
  orange: ["#fef3eb", "#fde4d3", "#fbccac", "#f9ab76", "#f7873b", "#f5690a", "#c95608", "#a14507", "#7a3405"],
  blue: ["#ebf9fe", "#d2f2fe", "#abe6fc", "#74d5fb", "#39c3f9", "#08b5f7", "#0694cb", "#0577a3", "#045a7c"],
  green: ["#f0faef", "#ddf5db", "#beebbc", "#94df90", "#67d161", "#40c639", "#35a22f", "#2a8226", "#20631d"],
  purple: ["#f3effa", "#e5dbf5", "#cebceb", "#ae90df", "#8b61d1", "#6e39c6", "#5a2fa2", "#482682", "#371d63"],
  magenta: ["#feecf7", "#fcd4ed", "#f9aede", "#f57ac8", "#f141b0", "#ed129d", "#c20f80", "#9c0c67", "#77094e"],
} as const;
type Hue = keyof typeof SCALES;

const WHITE_TEXT = "#ffffff";
const WHITE_CREDIT = "rgba(255, 255, 255, 0.86)";

// Six shades per traject hue, light to dark, mirroring the depth of a
// Tailwind color scale — later shades get white text once the background
// gets dark enough to need it.
function buildSpecificScale(scale: readonly string[]): PaletteEntry[] {
  return [0, 1, 2, 3, 4, 5].map((i) => {
    const dark = i >= 4;
    return {
      background: `linear-gradient(135deg, ${scale[i]} 0%, ${scale[i + 1]} 100%)`,
      border: scale[i + 2],
      text: dark ? WHITE_TEXT : scale[8],
      credit: dark ? WHITE_CREDIT : scale[7],
    };
  });
}

// Four shades for generic/shared courses — same idea, shorter scale.
function buildGenericScale(scale: readonly string[]): PaletteEntry[] {
  return [0, 1, 2, 3].map((i) => {
    const dark = i >= 3;
    return {
      background: `linear-gradient(135deg, ${scale[i]} 0%, ${scale[i + 1]} 100%)`,
      border: scale[i + 2],
      text: dark ? WHITE_TEXT : scale[8],
      credit: dark ? WHITE_CREDIT : scale[7],
    };
  });
}

function specificCategoryIds(hue: Hue): string[] {
  return [1, 2, 3, 4, 5, 6].map((n) => `specific-${hue}-${n}`);
}
const NONSPECIFIC_CATEGORIES = [
  "nonspecific-orange-1",
  "nonspecific-orange-2",
  "nonspecific-orange-3",
  "nonspecific-orange-4",
] as const;

export const CATEGORY_STYLES: Record<string, PaletteEntry> = {
  ...Object.fromEntries(
    (Object.keys(SCALES) as Hue[]).flatMap((hue) =>
      buildSpecificScale(SCALES[hue]).map((style, i) => [specificCategoryIds(hue)[i], style])
    )
  ),
  ...Object.fromEntries(
    buildGenericScale(SCALES.orange).map((style, i) => [NONSPECIFIC_CATEGORIES[i], style])
  ),
  "light-grey": {
    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    border: "#d1d5db",
    text: "#374151",
    credit: "#6b7280",
  },
  default: {
    background: "linear-gradient(135deg, #ffffff 0%, #e8eef6 100%)",
    border: "#cbd5e1",
    text: "#142033",
    credit: "#5b6677",
  },
};

const CATEGORY_SWATCH: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_STYLES).map(([category, style]) => [category, style.border])
);

// Every traject (study programme) gets its own hue for its specific courses;
// unrecognized/mixed trajects fall back to orange, the shared/generic hue.
function hueForTraject(traject?: string): Hue {
  const t = (traject ?? "").toLowerCase();
  if (t.includes("audiovisual")) return "magenta"; // AVD
  if (t.includes("cross media")) return "blue"; // CMD
  if (t.includes("interactive media")) return "green"; // IMD
  if (t.includes("print media")) return "purple"; // PMT
  return "orange"; // any unmatched traject
}

export function assignColors(
  courses: StructuredCourses
): Record<string, { color: string; category: string }> {
  const allFamilies = courses.map((course) => getFamily(course.course_name));
  const families = Array.from(new Set(allFamilies));

  // The hue is per-traject, not per-course: a course list handed to this
  // function always comes from a single traject page, so the first
  // programme-specific course (if any) tells us which hue to use.
  const hue = hueForTraject(courses.find((c) => !c.is_generic)?.traject ?? courses[0]?.traject);
  const specificCategories = specificCategoryIds(hue);

  // Every course in a family shares one category, so similarly-named courses
  // (e.g. "Interaction 1" / "Interaction 2") always render the same shade.
  const specificCategoryByFamily = Object.fromEntries(
    families.map((family, index) => [family, specificCategories[index % specificCategories.length]])
  ) as Record<string, string>;

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

    const category = specificCategoryByFamily[fam] ?? specificCategories[0];
    colorMap[course.course_name] = {
      color: CATEGORY_SWATCH[category],
      category,
    };
  });

  return colorMap;
}
