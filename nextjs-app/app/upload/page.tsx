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
    <div className="max-w-xl mx-auto pt-16">
      <h1 className="text-3xl font-bold mb-6">CSV Uploaden</h1>
      <div
        className={`border-2 border-dashed p-10 rounded text-center ${
          dragOver ? "bg-blue-50 border-blue-400" : "border-gray-400"
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
        <p className="text-lg">Sleep hier je CSV</p>
      </div>

      {parsed.length > 0 && (
        <a
          href="/trajects"
          className="mt-10 block w-full text-center py-3 rounded bg-green-600 text-white"
        >
          Bekijk Trajecten
        </a>
      )}
    </div>
  );
}