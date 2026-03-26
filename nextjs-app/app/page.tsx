"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto pt-20 text-center">
      <h1 className="text-4xl font-bold mb-6">IMD Curriculum Manager</h1>
      <p className="text-gray-600 mb-10">Upload een CSV of laad de standaard dataset</p>

      <div className="flex justify-center gap-6">
        <Link href="/upload">
          CSV Uploaden
        </Link>

        <Link href="/courses">
          Dataset Laden
        </Link>
      </div>
    </div>
  );
}