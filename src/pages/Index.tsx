import LoginForm from "@/components/LoginForm";

export default function Index() {
  return (
    <div className="relative w-full h-screen">
      {/* Usando o vídeo diretamente do Imgur */}
      <video
        src="https://i.imgur.com/SKNhnTL.mp4"
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      />

      <div className="flex items-center justify-center h-full">
        <LoginForm />
      </div>
    </div>
  );
}