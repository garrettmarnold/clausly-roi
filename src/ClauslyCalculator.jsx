// Clausly ROI Calculator – Web Version (Blue Theme + Modern Dropdown)
import { useState, useRef, useEffect } from "react";

const noShowOptions = [">10%", "10-20%", "20-50%", "<50%"];
const unqualifiedOptions = [">10%", "10-20%", "20-50%", "<50%"];

const mapDropdown = (value, mapping) => {
  return mapping[value.trim()] || 0.0;
};

const calculateROI = (hourlyRate, weeklyConsults, noShowPct, unqualifiedPct, intakeMinutes) => {
  const noShowRate = mapDropdown(noShowPct, {
    ">10%": 0.15,
    "10-20%": 0.20,
    "20-50%": 0.35,
    "<50%": 0.50,
  });

  const unqualifiedRate = mapDropdown(unqualifiedPct, {
    ">10%": 0.15,
    "10-20%": 0.20,
    "20-50%": 0.35,
    "<50%": 0.50,
  });

  const consultLoss = (noShowRate + unqualifiedRate) * weeklyConsults * hourlyRate;
  const adminLoss = (intakeMinutes * weeklyConsults / 60) * hourlyRate;
  const totalLoss = consultLoss + adminLoss;
  const roiRecovered = totalLoss * 0.75;

  return {
    consultLoss: consultLoss.toFixed(2),
    adminLoss: adminLoss.toFixed(2),
    totalLoss: totalLoss.toFixed(2),
    roiRecovered: roiRecovered.toFixed(2)
  };
};

function Dropdown({ label, options, value, onChange, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label htmlFor={id} className="block mb-1 text-sm font-semibold text-zinc-300">{label}</label>
      <div
        id={id}
        tabIndex={0}
        role="button"
        className="p-3 bg-zinc-800 rounded cursor-pointer flex justify-between items-center text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === "Enter") setOpen(o => !o); }}
      >
        <span>{value}</span>
        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <ul className="absolute z-20 mt-1 w-full bg-zinc-900 rounded shadow-lg max-h-40 overflow-auto">
          {options.map(opt => (
            <li
              key={opt}
              className="p-2 cursor-pointer hover:bg-blue-600"
              onClick={() => { onChange({ target: { name: id, value: opt } }); setOpen(false); }}
              tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") { onChange({ target: { name: id, value: opt } }); setOpen(false); } }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ClauslyCalculator() {
  const [form, setForm] = useState({
    hourlyRate: "300",
    weeklyConsults: "10",
    noShowPct: ">10%",
    unqualifiedPct: ">10%",
    intakeMinutes: "30",
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const roi = calculateROI(
      parseFloat(form.hourlyRate),
      parseInt(form.weeklyConsults),
      form.noShowPct,
      form.unqualifiedPct,
      parseInt(form.intakeMinutes)
    );
    setResult(roi);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-zinc-900 text-white rounded-xl shadow-lg ring-1 ring-zinc-700">
      <h2 className="text-2xl font-extrabold mb-6 tracking-wide">Clausly ROI Calculator</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="hourlyRate" className="block mb-1 text-sm font-semibold text-zinc-300">Hourly Rate ($)</label>
          <input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            value={form.hourlyRate}
            onChange={handleChange}
            className="w-full p-3 rounded bg-zinc-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <div>
          <label htmlFor="weeklyConsults" className="block mb-1 text-sm font-semibold text-zinc-300"># of Weekly Consults</label>
          <input
            id="weeklyConsults"
            name="weeklyConsults"
            type="number"
            value={form.weeklyConsults}
            onChange={handleChange}
            className="w-full p-3 rounded bg-zinc-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <Dropdown
          id="noShowPct"
          label="No-Show Rate"
          options={noShowOptions}
          value={form.noShowPct}
          onChange={handleChange}
        />

        <Dropdown
          id="unqualifiedPct"
          label="Unqualified Lead Rate"
          options={unqualifiedOptions}
          value={form.unqualifiedPct}
          onChange={handleChange}
        />

        <div>
          <label htmlFor="intakeMinutes" className="block mb-1 text-sm font-semibold text-zinc-300">Avg Intake Minutes per Lead</label>
          <input
            id="intakeMinutes"
            name="intakeMinutes"
            type="number"
            value={form.intakeMinutes}
            onChange={handleChange}
            className="w-full p-3 rounded bg-zinc-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 rounded text-white font-bold hover:bg-blue-500 transition"
        >
          Calculate ROI
        </button>
      </form>

      {result && (
        <section className="mt-8 space-y-3 border-t border-zinc-700 pt-5 text-lg font-mono">
          <div>→ <span className="font-semibold">Consult Loss</span>: <span className="text-red-400">${result.consultLoss}/week</span></div>
          <div>→ <span className="font-semibold">Admin Loss</span>: <span className="text-red-400">${result.adminLoss}/week</span></div>
          <div>→ <span className="font-semibold">Total Intake Waste</span>: <span className="text-red-400">${result.totalLoss}/week</span></div>
          <div>→ <span className="font-semibold text-blue-400">Clausly ROI Potential</span>: <span className="text-blue-400">${result.roiRecovered}/week</span></div>
        </section>
      )}
    </div>
  );
}
