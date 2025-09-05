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

const REAL_CHORES = [
  { id: 1, name: "Sweeping & Mopping", area: "Laundry Room", weight: 4, freq: "weekly", notes: "" },
  { id: 2, name: "Dusting", area: "Kitchen", weight: 3, freq: "weekly", notes: "" },
  { id: 3, name: "Coffee table", area: "Living Room", weight: 1, freq: "weekly", notes: "" },
  { id: 4, name: "Side tables", area: "Living Room", weight: 1, freq: "weekly", notes: "" },
  { id: 5, name: "Dining room table", area: "Living Room", weight: 1, freq: "weekly", notes: "" },
  { id: 6, name: "Wipe counters", area: "Kitchen", weight: 2, freq: "weekly", notes: "" },
  { id: 7, name: "Clean sink", area: "Kitchen", weight: 2, freq: "weekly", notes: "" },
  { id: 8, name: "Organizing fridge", area: "Kitchen", weight: 2, freq: "weekly", notes: "" },
  { id: 9, name: "Wipe washer & dryer", area: "Laundry Room", weight: 2, freq: "weekly", notes: "" },
  { id: 10, name: "Clean cat food bowls", area: "Laundry Room", weight: 1, freq: "weekly", notes: "" },
  { id: 11, name: "Sweep stairs", area: "Stairs", weight: 3, freq: "weekly", notes: "" },
  { id: 12, name: "Clean windows", area: "All Rooms", weight: 5, freq: "monthly", notes: "" },
  { id: 13, name: "Wipe doors", area: "All Rooms", weight: 3, freq: "monthly", notes: "" },
  { id: 14, name: "Wipe down trash can", area: "Laundry", weight: 2, freq: "monthly", notes: "" },
  { id: 15, name: "Deep clean fridge", area: "Kitchen", weight: 4, freq: "monthly", notes: "" },
  { id: 16, name: "Organizing cabinets", area: "Kitchen", weight: 3, freq: "monthly", notes: "" },
  { id: 17, name: "Downstairs bathroom", area: "Bathroom", weight: 4, freq: "monthly", notes: "" },
  { id: 18, name: "Clean cat room floor", area: "Laundry / Cat Area", weight: 3, freq: "monthly", notes: "" },
  { id: 19, name: "Clean dishwasher gasket", area: "Kitchen", weight: 2, freq: "monthly", notes: "" },
  { id: 20, name: "Clean dishwasher drain", area: "Kitchen", weight: 3, freq: "monthly", notes: "" },
  { id: 21, name: "Change Filter", area: "Upstairs", weight: 3, freq: "quarterly", notes: "" },
  { id: 22, name: "Clean baseboards", area: "All Rooms", weight: 4, freq: "quarterly", notes: "" },
  { id: 23, name: "Wash curtains", area: "Living Room", weight: 4, freq: "quarterly", notes: "" },
];

// 📌 Main component
function App() {
  const [peopleText, setPeopleText] = useState(DEFAULT_PEOPLE.join(", "));
  const peopleObjs = useMemo(
    () => peopleText.split(",").map(s => {
      const m = s.trim().match(/^(.+?)(?:<([^>]+)>)?$/);
      return { name: (m ? m[1] : s).trim(), email: (m && m[2] ? m[2].trim() : "") };
    }),
    [peopleText]
  );
  const people = useMemo(() => peopleObjs.map(p => p.name), [peopleObjs]);

  const [chores, setChores] = useState(REAL_CHORES);
  const [cycleWeeks] = useState(4);

  function generateAssignments() {
    const weeks = Array.from({ length: cycleWeeks }, (_, i) => ({
      week: i + 1,
      assignments: [],
      loads: Object.fromEntries(people.map(p => [p, 0]))
    }));

    let lastAssignee: Record<number, string> = {};

    for (let w = 0; w < cycleWeeks; w++) {
      const occ = [];
      for (const c of chores) {
        occ.push({ choreId: c.id, choreName: c.name, area: c.area, weight: c.weight });
      }

      for (const job of occ) {
        const ranked = people.map(p => ({
          p,
          load: weeks[w].loads[p],
          last: lastAssignee[job.choreId] === p
        })).sort((a, b) => (a.load - b.load) || (a.last ? 1 : -1));

        const chosen = ranked[0].p;
        weeks[w].assignments.push({ person: chosen, ...job });
        weeks[w].loads[chosen] += job.weight;
        lastAssignee[job.choreId] = chosen;
      }
    }

    return weeks;
  }

  const weeks = useMemo(generateAssignments, [peopleText, chores]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">Housemate Chore Balancer</h1>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Housemates</h2>
        <input
          className="w-full border rounded px-2 py-1"
          value={peopleText}
          onChange={e => setPeopleText(e.target.value)}
        />
      </div>

      {weeks.map((week, widx) => (
        <div key={week.week} className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">Week {week.week}</h3>
          <div className="grid grid-cols-3 gap-3">
            {people.map(p => {
              const mine = week.assignments.filter(a => a.person === p);
              return (
                <div key={p} className="border rounded-lg p-3">
                  <strong>{p}</strong>{" "}
                  <span className="text-xs text-gray-500">load {week.loads[p]}</span>
                  <ul className="mt-2 text-sm list-disc list-inside">
                    {mine.map((a, i) => (
                      <li key={i}>
                        {a.choreName} [{a.area}] (w{a.weight})
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

export default App;
