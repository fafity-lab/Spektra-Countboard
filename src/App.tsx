import { useEffect, useRef, useState } from "react";

type Team = {
  name: string;
  score: number;
};

/* ================= SOUND ================= */
function playSound(freq = 600, duration = 120) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = freq;
    gain.gain.value = 0.2;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, duration);
  } catch (e) {}
}

/* ================= BUZZER ================= */
function playBuzzer() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "square";

    osc1.frequency.value = 120;
    osc2.frequency.value = 80;

    gain.gain.value = 0.35;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    let up = true;

    const interval = setInterval(() => {
      osc1.frequency.value = up ? 220 : 120;
      osc2.frequency.value = up ? 160 : 80;
      up = !up;
    }, 120);

    setTimeout(() => {
      clearInterval(interval);

      osc1.stop();
      osc2.stop();

      ctx.close();
    }, 750);
  } catch (e) {}
}

export default function QuizScoreboardPRD() {
  const [teams, setTeams] = useState<Team[]>(() =>
    [0, 1, 2].map((i) => ({
      name: localStorage.getItem(`team-name-${i}`) || `Tim ${i + 1}`,
      score: Number(localStorage.getItem(`team-score-${i}`) || 0),
    }))
  );

  const setTeam = (index: number, data: Partial<Team>) => {
    setTeams((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...data };
      return copy;
    });
  };

 return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: "url('/bg-cinda.png')" }}>
      

      <div className="w-full max-w-5xl relative rounded-3xl shadow-xl p-6 border border-yellow-300 overflow-hidden bg-yellow-50">
 
        {/* LOGO */}
       <div className="absolute top-4 left-4 flex items-center gap-2 bg-amber-100/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-amber-300/60 shadow-sm z-10">
          <img src="/LOGO SMANDA.png" className="h-10 w-10 object-contain" />
          <img src="/LOGO OSIS SMAN 2 BOGOR.png" className="h-10 w-10 object-contain" />
          <img src="/LOGO AE'66.png" className="h-10 w-10 object-contain" />
        </div>

        {/* HEADER */}
        <header className="text-center mb-6 pt-16">
          <h1 className="text-4xl font-bold">LOMBA CEPAT TEPAT</h1>
          <h2 className="text-2xl font-semibold">CINDA 2026</h2>
        </header>

        <TimerSection />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {teams.map((t, i) => (
            <TeamCard
              key={i}
              team={t}
              index={i}
              setTeam={(data) => setTeam(i, data)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= TIMER ================= */

function TimerSection() {
  const [timeLeft, setTimeLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [input, setInput] = useState("30");

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);

          playBuzzer();

          setTimeout(() => {
            const resetValue = parseInt(input) || 0;
            setTimeLeft(resetValue);
          }, 1000);

          setRunning(false);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, input]);

  const format = (t: number) =>
    `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(
      t % 60
    ).padStart(2, "0")}`;

  return (
    <div className="text-center">

      <div className="text-7xl font-black mb-4 tabular-nums">
        {format(timeLeft)}
      </div>

      <input
        type="number"
        value={input}
        onChange={(e) => {
          const val = e.target.value;

          setInput(val);

          const sec = parseInt(val);

          if (!isNaN(sec)) {
            setTimeLeft(sec);
            setRunning(false);
          } else if (val === "") {
            setTimeLeft(0);
            setRunning(false);
          }
        }}
        className="mb-4 px-3 py-2 rounded-xl text-center font-bold bg-yellow-50 border border-yellow-200"
        placeholder="Masukan waktu"
      />

      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            if (timeLeft <= 0) {
              const sec = parseInt(input) || 0;
              setTimeLeft(sec);
            }

            setRunning(true);

            playSound(800, 150);
          }}
          className="px-5 py-2 bg-yellow-300 rounded-xl font-bold"
        >
          Start
        </button>

        <button
          onClick={() => setRunning(false)}
          className="px-5 py-2 bg-yellow-300 rounded-xl font-bold"
        >
          Pause
        </button>

        <button
          onClick={() => {
            setRunning(false);
            setTimeLeft(parseInt(input) || 0);
          }}
          className="px-5 py-2 bg-red-300 rounded-xl font-bold"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/* ================= TEAM CARD ================= */

function TeamCard({
  team,
  setTeam,
  index,
}: {
  team: Team;
  setTeam: (data: Partial<Team>) => void;
  index: number;
}) {
  const [hoverReset, setHoverReset] = useState(false);

  const timeoutRef = useRef<any>(null);

  const updateScore = (val: number) => {
    const newScore = team.score + val;

    setTeam({ score: newScore });

    localStorage.setItem(`team-score-${index}`, String(newScore));

    playSound(val > 0 ? 1000 : 400, 100);
  };

  const resetScore = () => {
    setTeam({ score: 0 });

    localStorage.setItem(`team-score-${index}`, "0");
  };

  return (
    <div className="relative rounded-2xl p-5 flex flex-col items-center border-2 border-yellow-300 bg-yellow-50 shadow-md">

      {/* NAME */}
      <input
        value={team.name}
        onChange={(e) => {
          setTeam({ name: e.target.value });

          localStorage.setItem(`team-name-${index}`, e.target.value);
        }}
        className="text-center text-xl font-bold bg-yellow-100 rounded-xl px-3 py-2 w-full mb-4 border"
      />

      {/* SCORE */}
      <div
        onMouseEnter={() => {
          timeoutRef.current = setTimeout(() => {
            setHoverReset(true);
          }, 2000);
        }}
        onMouseLeave={() => {
          clearTimeout(timeoutRef.current);

          setHoverReset(false);
        }}
        className="text-6xl font-black mb-4 relative"
      >
        {team.score}

        {hoverReset && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-3 flex flex-col items-center">
            <button
              onClick={resetScore}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded-xl"
            >
              Reset Score
            </button>
          </div>
        )}
      </div>

      {/* BUTTONS */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {[
          { label: "+30", v: 30 },
          { label: "+20", v: 20 },
          { label: "-10", v: -10 },
          { label: "-15", v: -15 },
        ].map((b) => (
          <button
            key={b.label}
            onClick={() => updateScore(b.v)}
            className={`py-4 rounded-xl font-extrabold text-xl ${
              b.v > 0 ? "bg-yellow-300" : "bg-red-400"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}