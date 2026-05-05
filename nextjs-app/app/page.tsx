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
    <div className="imd-page">
      <section className="imd-hero text-center">
        <div className="imd-kicker">Curriculum Manager</div>
        <h1 className="text-4xl font-bold tracking-[-0.03em] text-slate-900 sm:text-5xl">Beheer je trajecten en cursusoverzicht</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Upload een CSV, bewaar trajecten lokaal en blader door het curriculum in dezelfde visuele stijl als de traject- en cursuspagina&apos;s.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/upload" className="rounded-full border border-[#2d6aaa] bg-[linear-gradient(135deg,#5b9bd5_0%,#3d7fc0_100%)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            CSV Uploaden
          </Link>

          <Link href="/trajects" className="rounded-full border border-slate-300 bg-white/85 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-white">
            Trajecten bekijken
          </Link>
        </div>
      </section>

      <section className="border-t border-slate-200/80 pt-6">
        <div className="mb-6 flex flex-col gap-2 text-left sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-900">Mijn trajecten</h2>
          <p className="text-sm text-slate-500">Lokaal opgeslagen trajecten op dit toestel</p>
        </div>

        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white/55">
          {hasLoadedTrajects && trajects.length === 0 && (
            <p className="px-4 py-6 text-center text-slate-500">Geen trajecten gevonden. Upload een CSV om te beginnen!</p>
          )}
          {trajects.map((slug) => {
            const key = `traject_${slug}`;
            return (
              <Link
                key={key}
                href={`/trajects/${encodeURIComponent(slug)}`}
                className="flex items-center justify-between px-4 py-4 text-left transition hover:bg-white/70"
              >
                <p className="text-lg font-semibold text-slate-900">{slug}</p>
                <p className="text-sm text-slate-500">Open</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}