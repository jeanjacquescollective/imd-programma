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

    if (loading) return <div>Loading...</div>;

    if (trajects.length === 0) {
        return <div>No trajects found.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Trajects</h1>
            <div className="space-y-4">
                {trajects.map((traject) => (
                    <Link
                        key={traject}
                        href={`/trajects/${encodeURIComponent(traject)}`}
                        className="block p-4 border rounded-lg hover:shadow-lg transition-shadow"
                    >
                        <h2 className="text-xl font-semibold text-blue-600">{traject}</h2>
                    </Link>
                ))}
            </div>
        </div>
    );
}
