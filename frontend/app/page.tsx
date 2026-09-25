import HomeOrchestrator from "@/components/home/HomeOrchestrator";
import Chat from "@/components/Chat";

export default function Home() {
  return (
    <main className="min-h-[200vh] bg-background">
      <HomeOrchestrator />
      <section className="container mx-auto py-20 px-4">
        <Chat />
      </section>
    </main>
  );
}
