import ThreeCountdown from "@/components/ThreeCountdown";

export default function Home() {
  return (
    <main className="w-full h-screen">
      <ThreeCountdown startNumber={10} color="#00ff00" rotationSpeed={0.01} />
    </main>
  );
}
