"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCommercialSettings, saveCommercialSettings } from "@/lib/settings";
import CommercialRulesPanel from "./commercial/CommercialRulesPanel";
import CommercialPreviewPanel from "./commercial/CommercialPreviewPanel";
import {
  buildCommercialSummary,
  defaultRules,
  type CommercialRules,
} from "./commercial/commercialUtils";

export default function AdminCommercial() {
  const [rules, setRules] = useState<CommercialRules>(defaultRules);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetchCommercialSettings()
      .then((data) => {
        if (!mounted) return;

        if (data) {
          setRules({
            discount: String(data.discount ?? defaultRules.discount),
            wholesaleMin: String(
              data.wholesale_min ?? defaultRules.wholesaleMin,
            ),
            vat: String(data.vat ?? defaultRules.vat),
            validity: String(data.validity ?? defaultRules.validity),
            terms: data.terms || defaultRules.terms,
          });
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => buildCommercialSummary(rules), [rules]);

  function updateRule(field: keyof CommercialRules, value: string) {
    setRules((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);

    const ok = await saveCommercialSettings({
      discount: Number(rules.discount || 0),
      wholesale_min: Number(rules.wholesaleMin || 0),
      vat: Number(rules.vat || 0),
      validity: Number(rules.validity || 0),
      terms: rules.terms,
    });

    setSaving(false);

    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } else {
      alert("Error al guardar. Revisa que tengas permisos de administrador.");
    }
  }

  function restoreDefaults() {
    setRules(defaultRules);
    setSaved(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dff7fa] border-t-[#21b7c7] [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:border-t-[#00b8c8]" />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_410px] 2xl:grid-cols-[minmax(0,1fr)_450px]">
      <CommercialRulesPanel
        rules={rules}
        saving={saving}
        saved={saved}
        onChange={updateRule}
        onSave={handleSave}
        onRestore={restoreDefaults}
      />

      <CommercialPreviewPanel rules={rules} summary={summary} />
    </div>
  );
}