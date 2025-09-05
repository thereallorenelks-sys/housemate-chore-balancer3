import React, { useMemo, useState } from "react";

// --- Default housemates ---
const DEFAULT_PEOPLE = [
  "Loren <thereallorenelks@gmail.com>",
  "Zach <zachlamason@gmail.com>",
  "Tristyn <tristynelks@gmail.com>"
];

// --- Demo chores ---
const REAL_CHORES = [
  { id: 1, name: "Sweeping & Mopping", area: "Laundry Room", weight: 4 },
  { id: 2, name: "Side tables", area: "Living Room", weight: 1 },
  { id: 3, name: "Clean sink", area: "Kitchen", weight: 2 },
  { id: 4, name: "Dusting", area: "Kitchen", weight: 3 },
  { id: 5, name: "Dining room table", area: "Living Room", weight: 1 },
  { id: 6, name: "Organizing fridge", area: "Kitchen", weight: 2 },
  { id: 7, name: "Coffee table", area: "Living Room", weight: 1 },
  { id: 8, name: "Wipe washer & dryer", area: "Laundry Room", weight: 2 },
];

// --- Helper: format email body with CRLF ---
function formatEmailBody(lines: string[]) {
  return encodeURIComponent(lines.join("\r\n"));
}

export default function App() {
  const [peopleText, setPeopleText] = useState(DEFAULT_PEOPLE.join(", "));
  const [cycleWeeks] = useState(4);
  const [chores] = useState(REAL_CHORES);

  const peopleObjs = useMemo(
    () =>
      peopleText.split(",").map((s) => {
        const m = s.trim().match(/^(.+?)(?:<([^>]+)>)?$/);
        return {
          name: (m ? m[1] : s).trim(),
          email: m && m[2] ? m[2].trim() : "",
        };
      }),
    [peopleText]
  );
  const people = useMemo(() => peopleObjs.map((o) => o.name), [peopleObjs]);

  // --- Assignment logic ---
  function generateAssignments() {
    const weeks: any[] = Array.from({ length: cycleWeeks }, (_, i) => ({
      week: i + 1,
      assignments: [] as any[],
      loads: Object.fromEntries(people.map((p) => [p, 0])),
    }));

    for (let w = 0; w < cycleWeeks; w++) {
      const occ = [...chores]; // shallow copy
      occ.sort((a, b) => b.weight - a.weight);
      for (const job of occ) {
        const chosen = people.reduce((best, p) =>
          weeks[w].loads[p] < weeks[w].loads[best] ? p : best
        , people[0]);
        weeks[w].assignments.push({ person: chosen, ...job });
        weeks[w].loads[chosen] += job.weight;
      }
    }
    return weeks;
  }

  const weeks = useMemo(generateAssignments, [peopleText, chores, cycleWeeks]);

  function buildEmailBody(personName: string, widx: number) {
    const week = weeks[widx];
    const mine = week.assignments.filter((a) => a.person === personName);
    const lines = [
      `Hi ${personName},`,
      "",
      `Here are your chores for this week (Week ${week.week}).`,
      "",
    ];
    for (const g of mine) {
      lines.push(`- ${g.name} [${g.area}] (w${g.weight})`);
    }
    lines.push("");
    lines.push(`Total weekly load: ${week.loads[personName]}`);
    lines.push("");
    lines.push("Have a great week!");
    return lines;
  }

  function composeWeeklyEmails() {
    const widx = 0; // always week 1 for demo
    for (const o of peopleObjs) {
      if (!o.email) continue;
      const subject = `This Week's Chores — Week ${weeks[widx].week}`;
      const body = formatEmailBody(buildEmailBody(o.name, widx));
      const url = `mailto:${encodeURIComponent(o.email)}?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.open(url, "_blank");
    }
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Housemate Chore Balancer</h1>

      <div className="bg-white rounded-xl shadow p-4 border mb-6">
        <h2 className="font-semibold mb-2">Housemates</h2>
        <input
          className="w-full rounded-lg border px-3 py-2 mb-2"
          value={peopleText}
          onChange={(e) => setPeopleText(e.target.value)}
        />
        <button
          onClick={composeWeeklyEmails}
          className="px-3 py-2 rounded-lg border bg-blue-600 text-white hover:bg-blue-700"
        >
          Compose this week's emails
        </button>
      </div>

      {weeks.map((week) => (
        <div key={week.week} className="bg-white rounded-xl shadow p-4 border mb-4">
          <h2 className="font-semibold mb-2">Week {week.week}</h2>
          <div className="grid grid-cols-3 gap-3">
            {people.map((p) => {
              const mine = week.assignments.filter((a) => a.person === p);
              return (
                <div key={p} className="bg-slate-50 rounded-lg p-3">
                  <div className="font-medium mb-1">
                    {p} <span className="text-xs text-slate-500">load {week.loads[p]}</span>
                  </div>
                  <ul className="text-sm list-disc list-inside">
                    {mine.map((g, i) => (
                      <li key={i}>
                        {g.name} [{g.area}] (w{g.weight})
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
