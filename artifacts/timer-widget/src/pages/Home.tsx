import { Countdown } from "../components/Countdown";
import { Stopwatch } from "../components/Stopwatch";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-10 p-6 selection:bg-primary/30">
      <h1 className="text-3xl sm:text-4xl font-bold ">
        Timer Tools
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">

        {/* Countdown Card */}
        <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border/50 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-lg">
              ⏱️
            </span>
            <h2 className="text-2xl font-bold">Countdown</h2>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <Countdown />
          </div>
        </div>

        {/* Stopwatch Card */}
        <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border/50 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 bg-secondary/20 rounded-2xl flex items-center justify-center text-lg">
              🏃
            </span>
            <h2 className="text-2xl font-bold">Stopwatch & Laps</h2>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <Stopwatch />
          </div>
        </div>

      </div>
    </div>
  );
}