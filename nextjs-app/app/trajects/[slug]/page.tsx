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
        <div className="imd-page">
            <section className="imd-hero mb-8">
                <h1 className="text-4xl font-bold tracking-[-0.03em] text-slate-900">{trajectName}</h1>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {trajectYear ? `Academiejaar ${trajectYear}` : "Opgeslagen curriculumweergave"}
                </p>
            </section>
            <CourseGrid courses={courses} layout={layout} />
        </div>
    );
}
