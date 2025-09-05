import React, { useMemo, useState, useEffect } from "react";

/**
 * Housemate Chore Balancer
 * - Assigns chores fairly to people across weeks
 * - Balances weekly load (weight target ~10, flexible 8–12)
 * - Rotates chores to avoid repeats
 * - Generates weekly email drafts
 */

const DEFAULT_PEOPLE = [
  "Loren <thereallorenelks@gmail.com>",
  "Zach <zachlamason@gmail.com>",
  "Tristyn <tristynelks@gmail.com>"
];

const REAL_CHORES = [
  { id: 1, name: "Sweeping & Mopping", area: "Laundry Room", weight: 4, freq: "weekly" },
  { id: 2, name: "Dusting", area: "Kitchen", weight: 3, freq: "weekly" },
  { id: 3, name: "Coffee table", area: "Living Room", weight: 1, freq: "weekly" },
  { id: 4, name: "Side tables", area: "Living Room", weight: 1, freq: "weekly" },
  { id: 5, name: "Dining room table", area: "Living Room", weight: 1, freq: "weekly" },
  { id: 6, name: "Wipe counters", area: "Kitchen", weight: 2, freq: "weekly" },
  { id: 7, name: "Clean sink", area: "Kitchen", weight: 2, freq: "weekly" },
  { id: 8, name: "Organizing fridge", area: "Kitchen", weight: 2, freq: "weekly" },
  { id: 9, name: "Wipe washer & dryer", area: "Laundry Room", weight: 2, freq: "weekly" },
  { id: 10, name: "Clean cat food bowls", area: "Laundry Room", weight: 1, freq: "weekly" },
  { id: 11, name: "Sweep stairs", area: "Stairs", weight: 3, freq: "weekly" },
  { id: 12, name: "Clean windows", area: "All Rooms", weight: 5, freq: "monthly" },
  { id: 13, name: "Wipe doors", area: "All Rooms", weight: 3, freq: "monthly" },
  { id: 14, name: "Wipe down trash can", area: "Laundry", weight: 2, freq: "monthly" },
  { id: 15, name: "Deep clean fridge", area: "Kitchen", weight: 4, freq: "monthly" },
  { id: 16, name: "Organizing cabinets", area: "Kitchen", weight: 3, freq: "monthly" },
  { id: 17, name: "Downstairs bathroom", area: "Bathroom", weight: 4, freq: "monthly" },
  { id: 18, name: "Clean cat room floor", area: "Laundry / Cat Area", weight: 3, freq: "monthly" },
  { id: 19, name: "Clean dishwasher gasket", area: "Kitchen", weight: 2, freq: "monthly" },
  { id: 20, name: "Clean dishwasher drain", area: "Kitchen", weight: 3, freq: "monthly" },
  { id: 21, name: "Change Filter", area: "Upstairs", weight: 3, freq: "quarterly" },
  { id: 22, name: "Clean baseboards", area: "All Rooms", weight: 4, freq: "quarterly" },
  { id: 23, name: "Wash curtains", area: "Living Room", weight: 4, freq: "quarterly" },
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
    () => peopleText
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const m = s.match(/^(.+?)(?:<([^>]+)>)?$/);
        return {
          name: (m ? m[1] : s).trim(),
          email: (m && m[2] ? m[2] : "").trim()
        };
      }),
    [peopleText]
  );
  const people = useMemo(() => peopleObjs.map(o => o.name), [peopleObjs]);

  const [cycleWeeks] = useState(4);
  const [chores] = useState(REAL_CHORES);
  const [cycleStart, setCycleStart] = useState("");

  function freqOccurrencesInWeek(chore: any, weekIndex: number) {
    switch (chore.freq) {
      case "weekly": return 1;
      case "every_2_weeks": return weekIndex % 2 === 0 ? 1 : 0;
      case "monthly": return weekIndex % 4 === (chore.id % 4) ? 1 : 0;
      case "quarterly": return weekIndex === 0 ? 1 : 0;
      default: return 0;
    }
  }

  function generateAssignments() {
    const weeks = Array.from({ length: cycleWeeks }, (_, i) => ({
      week: i + 1,
      assignments: [] as any[],
      loads: Object.fromEntries(people.map(p => [p, 0]))
    }));

    const lastAssignee: Record<number, string> = {};

    for (let w = 0; w < cycleWeeks; w++) {
      const occ: any[] = [];
      for (const c of chores) {
        const times = freqOccurrencesInWeek(c, w);
        for (let i = 0; i < times; i++) occ.push(c);
      }

      occ.sort((a, b) => b.weight - a.weight);

      for (const job of occ) {
        const pool = people;
        const ranked = pool
          .map(p => ({
            p,
            load: weeks[w].loads[p],
            last: lastAssignee[job.id] === p
          }))
          .sort((a, b) => {
            if (a.load !== b.load) return a.load - b.load;
            if (a.last !== b.last) return a.last ? 1 : -1;
            return a.p.localeCompare(b.p);
          });

        let chosen = ranked[0].p;

        // enforce weekly cap ~10 with flex
        if (weeks[w].loads[chosen] + job.weight > 12) {
          const alt = ranked.find(r => weeks[w].loads[r.p] + job.weight <= 12);
          if (alt) chosen = alt.p;
        }

        if (weeks[w].loads[chosen] + job.weight <= 12) {
          weeks[w].assignments.push({ person: chosen, ...job });
          weeks[w].loads[chosen] += job.weight;
          lastAssignee[job.id] = chosen;
        }
      }
    }
    return weeks;
  }

  const weeks = useMemo(generateAssignments, [peopleText, chores]);

  function buildEmailBody(personName: string, widx: number) {
    const week = weeks[widx] || weeks[0];
    const mine = week.assignments.filter(a => a.person === personName);
    const grouped = mine.reduce((acc, a) => {
      const key = a.name + "|" + a.area + "|" + a.weight;
      if (!acc[key]) acc[key] = { ...a, count: 0 };
      acc[key].count++;
      return acc;
    }, {} as any);
    const items = Object.values(grouped);
    const total = items.reduce((s: number, g: any) => s + g.weight * g.count, 0);

    const lines: string[] = [];
    lines.push(`Hi ${personName},`);
    lines.push("");
    lines.push(`Here are your chores for this week (Week ${weeks[widx].week}).`);
    lines.push("");
    for (const g of items) {
      lines.push(`- ${g.name} [${g.area}] x${g.count} (w${g.weight})`);
    }
    lines.push("");
    lines.push(`Total weekly load: ${total}`);
    return lines.join("\r\n"); // CRLF fix
  }

  function composeWeeklyEmails() {
    for (const o of peopleObjs) {
      if (!o.email) continue;
      const subject = `This Week's Chores — Week ${weeks[0].week}`;
      const body = buildEmailBody(o.name, 0);
      const url = `mailto:${encodeURIComponent(o.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(url, "_blank");
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">Housemate Chore Balancer</h1>

      <div>
        <label className="block font-semibold">Housemates</label>
        <input
          className="w-full border rounded p-2"
          value={peopleText}
          onChange={e => setPeopleText(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-semibold">Cycle start (Monday)</label>
        <input
          type="date"
          className="border rounded p-2"
          value={cycleStart}
          onChange={e => setCycleStart(e.target.value)}
        />
      </div>

      <button
        onClick={composeWeeklyEmails}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Compose this week's emails
      </button>

      {weeks.map((week, widx) => (
        <div key={widx} className="border rounded-lg p-4 bg-white shadow space-y-3">
          <h2 className="font-bold">Week {week.week}</h2>
          <div className="grid grid-cols-3 gap-3">
            {people.map(p => {
              const mine = week.assignments.filter(a => a.person === p);
              return (
                <div key={p} className="border rounded p-2">
                  <h3 className="font-semibold">{p} <span className="text-xs text-gray-500">load {week.loads[p]}</span></h3>
                  <ul className="text-sm list-disc list-inside">
                    {mine.map((m, i) => (
                      <li key={i}>{m.name} [{m.area}] (w{m.weight})</li>
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
