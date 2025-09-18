import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isAdminEmail } from "@/lib/adminAllowlist";
import { Navigate } from "react-router-dom";

type Props = { children: React.ReactNode };

export default function RequireAdmin({ children }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        const uid = user?.id;
        const email = user?.email ?? null;
        if (!uid) {
          if (!cancelled) setAllowed(false);
          return;
        }

        // Prefer allowlist by email (no DB needed). If needed, we can fall back to table later.
        if (isAdminEmail(email)) {
          if (!cancelled) setAllowed(true);
        } else {
          if (!cancelled) setAllowed(false);
        }
      } catch {
        if (!cancelled) setAllowed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-tech-blue-300">Carregando…</div>
    );
  }
  if (!allowed) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
