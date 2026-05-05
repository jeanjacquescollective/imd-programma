"use client";

import { useEffect } from "react";
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

export function DataBootstrap() {
  useEffect(() => {
    const existing = localStorage.getItem("ECTS");
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return; // already has data, skip
        }
      } catch {
        // malformed — fall through and reload
      }
    }

    fetch("/data.csv")
      .then((res) => {
        if (!res.ok) return;
        return res.text();
      })
      .then((text) => {
        if (!text) return;
        Papa.parse<Record<string, unknown>>(text, {
          header: true,
          complete: (result) => {
            const cleaned = result.data.map(cleanRow);
            const ectsByTraject: Record<string, Record<string, unknown>[]> = {};
            for (const row of cleaned) {
              const trajectKey =
                typeof row.traject === "string" && row.traject.trim()
                  ? row.traject.trim()
                  : "Unknown Trajectory";
              if (!ectsByTraject[trajectKey]) ectsByTraject[trajectKey] = [];
              ectsByTraject[trajectKey].push(row);
            }
            localStorage.setItem("ECTS", JSON.stringify(ectsByTraject));
          },
        });
      })
      .catch(() => {
        // no default CSV available, silently skip
      });
  }, []);

  return null;
}
