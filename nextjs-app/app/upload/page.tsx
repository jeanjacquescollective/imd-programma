
"use client";

import { useState } from "react";
import Papa from "papaparse";

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<any[]>([]);

  function handleFile(file: File) {
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        setParsed(result.data);
        localStorage.setItem("courses", JSON.stringify(result.data));
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
          handleFile(file);
        }}
      >
        <p className="text-lg">Sleep hier je CSV</p>
      </div>

      {parsed.length > 0 && (
        <a
          href="/courses"
          className="mt-10 block w-full text-center py-3 rounded bg-green-600 text-white"
        >
          Bekijk Cursussen
        </a>
      )}
    </div>
  );
}
