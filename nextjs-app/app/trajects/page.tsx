'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course } from '@/types/course';

type TrajectsData = Record<string, Course[]>;

export default function TrajectPage() {
    const [trajects, setTrajects] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = localStorage.getItem('ECTS');
        if (data) {
            const trajectsData: TrajectsData = JSON.parse(data);
            setTrajects(Object.keys(trajectsData));
        }
        setLoading(false);
    }, []);

    if (loading) return <div className="imd-page"><div className="imd-soft-card p-8 text-center text-slate-500">Loading...</div></div>;

    if (trajects.length === 0) {
        return <div className="imd-page"><div className="imd-soft-card p-8 text-center text-slate-500">No trajects found.</div></div>;
    }

    return (
        <div className="imd-page">
            <section className="imd-hero mb-8">
                <h1 className="text-4xl font-bold tracking-[-0.03em] text-slate-900">Kies een traject</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Open een opgeslagen traject en bekijk meteen het volledige semesterrooster in de curriculumgrid.</p>
            </section>
            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white/55">
                {trajects.map((traject) => (
                    <Link
                        key={traject}
                        href={`/trajects/${encodeURIComponent(traject)}`}
                        className="flex items-center justify-between px-5 py-4 transition hover:bg-white/70"
                    >
                        <h2 className="text-xl font-semibold text-slate-900">{traject}</h2>
                        <p className="text-sm text-slate-500">Open</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
