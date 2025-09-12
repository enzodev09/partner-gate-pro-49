import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Centraliza o conteúdo vertical e horizontalmente com um leve destaque de fundo.
 */
export default function CenteredPage({ children, className = "" }: Props) {
  return (
    <div
      className={
        "relative min-h-screen flex items-center justify-center px-4 py-10 " +
        "bg-gradient-background " +
        className
      }
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(214_100%_60%_/_0.06)_0%,_transparent_50%)]"
      />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
