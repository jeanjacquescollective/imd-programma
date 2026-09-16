'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { RawCourse } from '@/types/course';
import { CourseGrid } from "@/components/courses/CourseGrid";
import { useCourseLayout } from "@/hooks/useCourseLayout";
import { getTrajectCoursesFromStorage } from '@/lib/courses/storage';

type TrajectsData = Record<string, RawCourse[]>;

export default function TrajectPage() {
    const [loading, setLoading] = useState(true);
    const [rawCourses, setRawCourses] = useState<RawCourse[]>([]);
    const [trajectYear, setTrajectYear] = useState<string | null>(null);
        const [trajectName, setTrajectName] = useState("");
        const params = useParams<{ slug: string | string[] }>();
        const slug = useMemo(
            () => (Array.isArray(params.slug) ? params.slug[0] : params.slug) ?? "",
            [params.slug]
        );
    const { courses, layout } = useCourseLayout(rawCourses);



    useEffect(() => {
                const trajectsData: TrajectsData = getTrajectCoursesFromStorage();
                const matchedName = Object.keys(trajectsData).find(
                    (name) => encodeURIComponent(name) === slug || name === slug
                );
                const matchedYearValue = matchedName ? trajectsData[matchedName]?.[0]?.academic_year : null;
                const matchedYear = matchedYearValue != null ? String(matchedYearValue) : null;

                if (matchedName) {
                    setTrajectName(matchedName);
                    setTrajectYear(matchedYear);
                    setRawCourses(trajectsData[matchedName] || []);
                } else {
                    setTrajectName(decodeURIComponent(slug || ""));
                    setTrajectYear(null);
                    setRawCourses([]);
                }

        setLoading(false);
    }, [slug]);

    if (loading || !layout) return <div className="imd-page"><div className="imd-soft-card p-8 text-center text-slate-500">Loading...</div></div>;

    if (courses.length === 0) {
        return <div className="imd-page"><div className="imd-soft-card p-8 text-center text-slate-500">No courses found for this trajectory.</div></div>;
    }

    return (
        <div className="flex flex-col lg:h-[100dvh] lg:overflow-hidden">
            <div className="imd-page shrink-0 pb-0 pt-4">
                <section className="imd-hero mb-3 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {trajectYear ? `Academiejaar ${trajectYear}` : "Opgeslagen curriculumweergave"}
                    </p>
                    <h1 className="mt-1 text-4xl font-bold tracking-[-0.03em] text-slate-900">{trajectName}</h1>
                </section>
            </div>
            <div className="imd-grid-wrap min-h-0 flex-1">
                <CourseGrid courses={courses} layout={layout} />
            </div>
        </div>
    );
}
