import React, { useState, useEffect } from "react";

type Chore = {
  name: string;
  location: string;
  weight: number;
  frequency: "Weekly" | "Monthly" | "Quarterly";
};

type Assignment = {
  person: string;
  chores: Chore[];
  load: number;
};

const defaultChores: Chore[] = [
  { name: "Clean sink", location: "Kitchen", weight: 2, frequency: "Weekly" },
  { name: "Wipe counters", location: "Kitchen", weight: 2, frequency: "Weekly" },
  { name: "Dusting", location: "Living Room", weight: 3, frequency: "Weekly" },
  { name: "Sweep stairs", location: "Stairs", weight: 3, frequency: "Weekly" },
  { name: "Change Filter", location: "Upstairs", weight: 4, frequency: "Quarterly" },
  { name: "Wash curtains", location: "Living Room", weight: 4, frequency: "Quarterly" },
];

const housemates = ["Loren", "Zach", "Tristyn"];

function generateAssignments(chores: Chore[], weeks: number): Assignment[][] {
  const results: Assignment[][] = [];
  for (let w = 0; w < weeks; w++) {
    const assignments: Assignment[] = housemates.map((h) => ({ person: h, chores: [], load: 0 }));

    chores.forEach((chore, i) => {
      if (chore.frequency === "Weekly") {
        const target = assignments[i % housemates.length];
        target.chores.push(chore);
        target.load += chore.weight;
      } else if (chore.frequency === "Monthly") {
        if (w % 4 === 0) {
          const target = assignments[i % housemates.length];
          target.chores.push(chore);
          target.load += chore.weight;
        }
      } else if (chore.frequency === "Quarterly") {
        if (w % 4 === 0) {
          // Give to ALL in same week
          assignments.forEach((a) => {
            a.chores.push(chore);
            a.load += chore.weight;
          });
        }
      }
    });

    // adjust to keep loads roughly in 8–12 range
    assignments.forEach((a) => {
      if (a.load < 8) {
        // give extra small chores
        const fillers = chores.filter((c) => c.weight <= 2 && c.frequency === "Weekly");
        while (a.load < 8 && fillers.length > 0) {
          const f = fillers[Math.floor(Math.random() * fillers.length)];
          a.chores.push(f);
          a.load += f.weight;
        }
      }
    });

    results.push(assignments);
  }
  return results;
}

const App: React.FC = () => {
  const [chores, setChores] = useState<Chore[]>(() => {
    const stored = localStorage.getItem("chores");
    return stored ? JSON.parse(stored) : defaultChores;
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "edit">("dashboard");

  useEffect(() => {
    localStorage.setItem("chores", JSON.stringify(chores));
  }, [chores]);

  const [newChore, setNewChore] = useState<Chore>({
    name: "",
    location: "",
    weight: 1,
    frequency: "Weekly",
  });

  const addChore = () => {
    if (!newChore.name.trim()) return;
    setChores([...chores, newChore]);
    setNewChore({ name: "", location: "", weight: 1, frequency: "Weekly" });
  };

  const assignments = generateAssignments(chores, 4);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Housemate Chore Balancer</h1>

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === "dashboard" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "edit" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
          onClick={() => setActiveTab("edit")}
        >
          Edit Chores
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div>
          {assignments.map((week, i) => (
            <div key={i} className="mb-6 p-4 border rounded-lg shadow bg-white">
              <h2 className="text-lg font-semibold mb-4">Week {i + 1}</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {week.map((a, j) => (
                  <div key={j} className="p-3 border rounded bg-gray-50">
                    <h3 className="font-bold">
                      {a.person} <span className="text-sm text-gray-500">load {a.load}</span>
                    </h3>
                    <ul className="list-disc ml-5 mt-2">
                      {a.chores.map((c, k) => (
                        <li key={k}>
                          {c.name} [{c.location}] (w{c.weight})
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "edit" && (
        <div className="p-4 border rounded-lg shadow bg-white">
          <h2 className="text-lg font-semibold mb-4">Add a Chore</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Chore name"
              value={newChore.name}
              onChange={(e) => setNewChore({ ...newChore, name: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Location"
              value={newChore.location}
              onChange={(e) => setNewChore({ ...newChore, location: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              min="1"
              max="5"
              value={newChore.weight}
              onChange={(e) => setNewChore({ ...newChore, weight: Number(e.target.value) })}
              className="border p-2 rounded"
            />
            <select
              value={newChore.frequency}
              onChange={(e) => setNewChore({ ...newChore, frequency: e.target.value as Chore["frequency"] })}
              className="border p-2 rounded"
            >
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
          </div>
          <button onClick={addChore} className="bg-blue-600 text-white px-4 py-2 rounded">
            Add Chore
          </button>

          <h3 className="mt-6 font-semibold">Chore List</h3>
          <ul className="list-disc ml-5 mt-2">
            {chores.map((c, i) => (
              <li key={i}>
                {c.name} [{c.location}] (w{c.weight}, {c.frequency})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
