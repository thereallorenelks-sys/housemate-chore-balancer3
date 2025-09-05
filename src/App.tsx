import React, { useMemo, useState, useEffect } from "react";

const DEFAULT_PEOPLE = [
  "Loren <thereallorenelks@gmail.com>",
  "Zach <zachlamason@gmail.com>",
  "Tristyn <tristynelks@gmail.com>"
];

const FREQS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "twice_week", label: "Twice a Week" },
  { key: "every_2_weeks", label: "Every 2 Weeks" },
  { key: "monthly", label: "Monthly (staggered)" },
  { key: "quarterly", label: "Quarterly (group week)" },
];

const AREA_OPTIONS = [
  "All Rooms",
  "Bathroom",
  "Kitchen",
  "Laundry",
  "Laundry / Cat Area",
  "Laundry Room",
  "Living Room",
  "Stairs",
  "Upstairs",
];

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function App() {
  const [peopleText, setPeopleText] = useState(DEFAULT_PEOPLE.join(", "));
  const peopleObjs = useMemo(
    () =>
      peopleText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const m = s.match(/^(.+?)(?:<([^>]+)>)?$/);
          return {
            name: (m ? m[1] : s).trim(),
            email: (m && m[2] ? m[2] : "").trim(),
          };
        }),
    [peopleText]
  );
  const people = useMemo(() => peopleObjs.map((o) => o.name), [peopleObjs]);

  const [cycleWeeks, setCycleWeeks] = useState(4);
  const [chores] = useState([
    { id: 1, name: "Sweeping & Mopping", area: "Laundry Room", weight: 4, freq: "weekly" },
    { id: 2, name: "Dusting", area: "Kitchen", weight: 3, freq: "weekly" },
    { id: 3, name: "Coffee table", area: "Living Room", weight: 1, freq: "weekly" },
    { id: 4, name: "Side tables", area: "Living Room", weight: 1, freq: "weekly" },
    { id: 5, name: "Dining room table", area: "Living Room", weight: 1, freq: "weekly" },
    { id: 6, name: "Wipe counters", area: "Kitchen", weight: 2, freq: "weekly" },
    { id: 7, name: "Clean sink", area: "Kitchen", weight: 2, freq: "weekly" },
    { id: 8, name: "Organizing fridge", area: "Kitchen", weight: 2, freq: "weekly" },
    { id: 9, name: "Wipe washer & dryer", area: "Laundry Room", weight: 2, freq: "weekly" },
  ]);
  const [cycleStart, setCycleStart] = useState("");

  function generateAssignments() {
    return Array.from({ length: cycleWeeks }, (_, i) => ({
      week: i + 1,
      assignments: people.map((p) => ({
        person: p,
        chores: chores.filter((_, idx) => idx % people.length === i % people.length),
      })),
    }));
  }

  const weeks = useMemo(generateAssignments, [peopleText, cycleWeeks, chores]);

  function getCurrentWeekIndex() {
    if (!cycleStart) return 0;
    const start = new Date(cycleStart + "T00:00:00");
    const now = new Date();
    const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
    if (days < 0) return 0;
    return days % (cycleWeeks * 7) < cycleWeeks * 7 ? Math.floor(days / 7) % cycleWeeks : 0;
  }

  function buildEmailBody(personName: string, widx: number) {
    const week = weeks[widx] || weeks[0];
    const mine = week.assignments.find((a) => a.person === personName)?.chores || [];
    const total = mine.reduce((s, g) => s + g.weight, 0);

    const lines: string[] = [];
    lines.push(`Hi ${personName},`);
    lines.push("");
    lines.push(`Here are your chores for this week (Week ${week.week}).`);
    lines.push("");
    if (mine.length === 0) {
      lines.push("- none -");
    } else {
      for (const g of mine) {
        const areaPart = g.area ? ` [${g.area}]` : "";
        lines.push(`- ${g.name}${areaPart} (w${g.weight})`);
      }
    }
    lines.push("");
    lines.push(`Total weekly load: ${total}`);
    lines.push("");
    lines.push("Have a great week!");

    // CRLF fix for Outlook/Gmail
    return lines.join("\r\n");
  }

  function composeWeeklyEmails() {
    const widx = getCurrentWeekIndex();
    for (const o of peopleObjs) {
      if (!o.email) continue;
      const subject = `This Week's Chores — Week ${weeks[widx]?.week || 1}`;
      const body = buildEmailBody(o.name, widx);
      const url = `mailto:${encodeURIComponent(o.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(url, "_blank");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Housemate Chore Balancer</h1>

      <div className="mb-4">
        <label className="block font-medium">Housemates</label>
        <input
          className="w-full rounded border px-2 py-1"
          value={peopleText}
          onChange={(e) => setPeopleText(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Cycle start (Monday)</label>
        <input
          type="date"
          className="rounded border px-2 py-1"
          value={cycleStart}
          onChange={(e) => setCycleStart(e.target.value)}
        />
      </div>

      <button
        onClick={composeWeeklyEmails}
        className="px-3 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        Compose this week's emails
      </button>

      <div className="mt-6 space-y-4">
        {weeks.map((week) => (
          <div key={week.week} className="border rounded-lg p-3">
            <h2 className="font-semibold mb-2">Week {week.week}</h2>
            <div className="grid grid-cols-3 gap-2">
              {week.assignments.map((a) => (
                <div key={a.person} className="bg-slate-50 rounded p-2">
                  <div className="font-medium">{a.person}</div>
                  <ul className="text-sm list-disc pl-4">
                    {a.chores.length === 0 ? (
                      <li className="text-slate-400">—</li>
                    ) : (
                      a.chores.map((c, i) => (
                        <li key={i}>
                          {c.name} [{c.area}] (w{c.weight})
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
