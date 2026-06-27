import { useCallback, useState } from "react";
import { processLogoFile } from "@/canvas/logoProcessor";
import type { ProcessedLogo } from "@/types/mockup.types";

export function useLogoUpload() {
  const [logo, setLogo] = useState<ProcessedLogo | null>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const uploadLogo = useCallback(async (file: File | undefined) => {
    if (!file) return null;
    setProcessing(true);
    setError("");
    try {
      const result = await processLogoFile(file);
      if (!result.ok) {
        setError(result.message);
        return null;
      }
      setLogo(result.logo);
      return result.logo;
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    logo,
    error,
    processing,
    uploadLogo,
    setLogo,
    setError,
  };
}
