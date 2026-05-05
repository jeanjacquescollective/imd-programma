"use client";

import { Course } from "@/types/course";
import Link from "next/link";
import { useEffect, useState } from "react";
type TrajectsData = Record<string, Course[]>;

export default function Home() {
  const [trajects, setTrajects] = useState<string[]>([]);
  const [hasLoadedTrajects, setHasLoadedTrajects] = useState(false);

  useEffect(() => {
   const data = localStorage.getItem('ECTS');
        if (data) {
            const trajectsData: TrajectsData = JSON.parse(data);
            setTrajects(Object.keys(trajectsData));
        }
    setHasLoadedTrajects(true);
  }, []);

  return (
    <div className="max-w-3xl mx-auto pt-20 text-center">
      <h1 className="text-4xl font-bold mb-6">IMD Curriculum Manager</h1>
      <p className="text-gray-600 mb-10">Upload een CSV of laad de standaard dataset</p>

      <div className="flex justify-center gap-6">
        <Link href="/upload">
          CSV Uploaden
        </Link>

        <Link href="/trajects">
          Trajecten bekijken
        </Link>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Mijn Trajecten</h2>
        <div className="space-y-2">
          {hasLoadedTrajects && trajects.length === 0 && (
            <p className="text-gray-500">Geen trajecten gevonden. Upload een CSV om te beginnen!</p>
          )}
          {trajects.map((slug) => {
            const key = `traject_${slug}`;
            return (
                  <Link key={key} href={`/trajects/${encodeURIComponent(slug)}`} className="block p-3 bg-blue-50 hover:bg-blue-100 rounded">
                    {slug}
                  </Link>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}