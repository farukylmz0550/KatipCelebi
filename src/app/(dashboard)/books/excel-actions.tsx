"use client";

import { useState, useTransition } from "react";
import { exportLibraryExcel, buildTemplateExcel, importExcelFile } from "@/app/actions/excel";

function downloadBase64(base64: string, filename: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExcelActions() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function onExport() {
    startTransition(async () => {
      const { base64, filename } = await exportLibraryExcel();
      downloadBase64(base64, filename);
    });
  }
  function onTemplate() {
    startTransition(async () => {
      const { base64, filename } = await buildTemplateExcel();
      downloadBase64(base64, filename);
    });
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setMsg("File too large (20MB limit)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      startTransition(async () => {
        const res = await importExcelFile(base64);
        setMsg(res.error ?? `Imported ${res.imported} books`);
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={onTemplate} disabled={pending} className="rounded border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-neutral-700">Template</button>
      <button onClick={onExport} disabled={pending} className="rounded border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-neutral-700">Export</button>
      <label className="rounded border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700">
        Import Excel
        <input type="file" accept=".xlsx,.xls" onChange={onFile} className="hidden" />
      </label>
      {msg && <span className="text-sm text-neutral-600 dark:text-neutral-400">{msg}</span>}
    </div>
  );
}
