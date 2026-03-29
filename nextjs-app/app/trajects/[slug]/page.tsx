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

                if (matchedName) {
                    setTrajectName(matchedName);
                    setRawCourses(trajectsData[matchedName] || []);
                } else {
                    setTrajectName(decodeURIComponent(slug || ""));
                    setRawCourses([]);
                }

        setLoading(false);
    }, [slug]);

    if (loading || !layout) return <div>Loading...</div>;

    if (courses.length === 0) {
        return <div>No courses found for this trajectory.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">{trajectName}</h1>
            <CourseGrid courses={courses} layout={layout} />
        </div>
    );
}
