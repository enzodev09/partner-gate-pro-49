import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type WithdrawMethod = "PIX" | null;

type WithdrawState = {
  method: WithdrawMethod;
  pixKey: string;
  amount: number | null;
  deadlineISO: string | null; // agora + 1h após confirmar
  lastRequestId?: string | null; // id do saque criado no Supabase (se disponível)
};

type WithdrawActions = {
  setMethod: (m: WithdrawMethod) => void;
  setPixKey: (k: string) => void;
  setAmount: (v: number | null) => void;
  confirm: () => void; // seta deadline = now + 1h
  setLastRequestId: (id: string | null) => void;
  reset: () => void;
};

const DEFAULT: WithdrawState = { method: null, pixKey: "", amount: null, deadlineISO: null, lastRequestId: null };
const STORAGE_KEY = "withdrawFlow";

const Ctx = createContext<{ state: WithdrawState; actions: WithdrawActions } | null>(null);

export function WithdrawProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WithdrawState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const actions: WithdrawActions = useMemo(
    () => ({
      setMethod: (m) => setState((s) => ({ ...s, method: m })),
      setPixKey: (k) => setState((s) => ({ ...s, pixKey: k })),
      setAmount: (v) => setState((s) => ({ ...s, amount: v })),
      confirm: () =>
        setState((s) => {
          const deadline = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // +1h
          return { ...s, deadlineISO: deadline };
        }),
      setLastRequestId: (id) => setState((s) => ({ ...s, lastRequestId: id })),
      reset: () => setState(DEFAULT),
    }),
    []
  );

  return <Ctx.Provider value={{ state, actions }}>{children}</Ctx.Provider>;
}

export function useWithdraw() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWithdraw must be used within WithdrawProvider");
  return ctx;
}
