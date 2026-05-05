"use client";

import { useState } from "react";
import Papa from "papaparse";
import JSON5 from "json5";

const ARRAY_FIELDS = ["learning_outcomes", "evaluation", "study_programs"];

function parseField(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    return JSON5.parse(value.replace(/\\xa0/g, "\u00a0"));
  } catch {
    return [];
  }
}

function cleanRow(row: Record<string, unknown>): Record<string, unknown> {
  const out = { ...row };
  ARRAY_FIELDS.forEach((field) => {
    out[field] = parseField(row[field]);
  });
  return out;
}

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<any[]>([]);

  function handleFile(file: File) {
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const cleaned = (result.data as Record<string, unknown>[]).map(cleanRow);
        const ectsByTraject = cleaned.reduce<Record<string, Record<string, unknown>[]>>(
          (acc, row) => {
            const trajectKey =
              typeof row.traject === "string" && row.traject.trim()
                ? row.traject.trim()
                : "Unknown Trajectory";
            if (!acc[trajectKey]) {
              acc[trajectKey] = [];
            }
            acc[trajectKey].push(row);
            return acc;
          },
          {}
        );
        setParsed(cleaned);
        const existing = localStorage.getItem("ECTS");
        const merged = { ...(existing ? JSON.parse(existing) : {}), ...ectsByTraject };
        localStorage.setItem("ECTS", JSON.stringify(merged));
      },
    });
  }

  return (
    <div className="imd-page">
      <section className="imd-hero mb-8">
        <h1 className="text-4xl font-bold tracking-[-0.03em] text-slate-900">CSV uploaden</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Sleep een exportbestand in de zone hieronder. De trajecten worden lokaal opgeslagen en zijn daarna meteen beschikbaar in de traject- en overzichtspagina&apos;s.</p>
      </section>

      <section className="pt-2">
        <div
          className={`rounded-[1.75rem] border-2 border-dashed p-12 text-center transition ${
            dragOver ? "border-blue-400 bg-blue-50/80" : "border-slate-300 bg-white/60"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
        >
          <p className="text-lg font-semibold text-slate-900">Sleep hier je CSV</p>
          <p className="mt-2 text-sm text-slate-500">Papaparse leest het bestand in en groepeert de data per traject.</p>
        </div>

        {parsed.length > 0 && (
          <a
            href="/trajects"
            className="mt-8 inline-block rounded-full border border-[#4db84a] bg-[linear-gradient(135deg,#7dd87a_0%,#58c754_100%)] px-6 py-3 text-sm font-semibold text-[#103410] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Bekijk Trajecten
          </a>
        )}
      </section>
    </div>
  );
}