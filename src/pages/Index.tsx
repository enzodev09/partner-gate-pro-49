import LoginForm from "@/components/LoginForm";

export default function Index() {
  // Background video (RIGHT column)
  const rightVideo =
    "https://oxnkdfaiwbnbbmrjlkei.supabase.co/storage/v1/object/public/imagens/imagens%20hive%20of%20clicks/Blue%20and%20White%20Modern%20Background%20Instagram%20Post.mp4";

  return (
    <div className="relative grid h-screen w-full lg:grid-cols-2">
      {/* Coluna esquerda: formulário compacto */}
      <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-10 overflow-hidden bg-gradient-to-b from-[#0A1630] via-[#0A1B3F] to-[#0A1630]">
        <div className="w-full max-w-sm sm:max-w-md">
          <LoginForm />
        </div>
      </div>

      {/* Coluna direita: vídeo (somente desktop) */}
      <div className="relative hidden lg:block">
        <video
          aria-hidden
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={rightVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Divisor LED azul entre colunas (somente desktop) */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden lg:block">
        {/* linha fina central */}
        <div className="absolute inset-y-0 left-0 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-sky-400 to-transparent" />
        {/* brilho próximo */}
        <div className="absolute inset-y-0 left-0 -translate-x-1/2 w-1 bg-gradient-to-b from-transparent via-sky-500/40 to-transparent blur-sm" />
        {/* halo mais amplo */}
        <div className="absolute inset-y-0 left-0 -translate-x-1/2 w-2 bg-gradient-to-b from-transparent via-blue-600/20 to-transparent blur-xl" />
      </div>
    </div>
  );
}