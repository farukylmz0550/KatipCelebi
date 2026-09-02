"use client";

import { useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { importBooksByIsbn } from "@/app/actions/books";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ImportForm({ dict }: { dict: { importPlaceholder: string; importCta: string } }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function handleImport() {
    startTransition(async () => {
      const { imported } = await importBooksByIsbn(text);
      setResult(imported);
      setText("");
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={dict.importPlaceholder}
        rows={3}
      />
      <Button type="button" variant="outline" size="sm" onClick={handleImport} disabled={pending || !text.trim()}>
        <Upload size={14} />
        {dict.importCta}
      </Button>
      {result !== null && (
        <span className="ml-2 text-sm text-muted-foreground">+{result}</span>
      )}
    </div>
  );
}
