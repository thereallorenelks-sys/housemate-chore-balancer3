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
  { name: "Dusting", location: "Living Room", weight: 3, frequency: "Weekly" },
  { name: "Sweep stairs", location: "Stairs", weight: 3, frequency: "Weekly" },
  { name: "Change Filter", location: "Upstairs", weight: 4, frequency: "Monthly" },
  { name: "Wash curtains", location: "Living Room", weight: 4, frequency: "Quarterly" },
];

const housemates = ["Loren", "Zach", "Tristyn"];

function App() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "edit">("dashboard");

  // Load from localStorage or use defaults
  useEffect(() => {
    const saved = localStorage.getItem("chores");
    if (saved) {
      setChores(JSON.parse(saved));
    } else {
      setChores(defaultChores);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chores", JSON.stringify(chores));
  }, [chores]);

  const addChore = (chore: Chore) => {
    setChores([...chores, chore]);
  };

  // Create balanced assignments (8–12 load per person)
  const generateAssignments = (week: number): Assignment[] => {
    const assignments: Assignment[] = housemates.map((p) => ({
      person: p,
      chores: [],
      load: 0,
    }));

    const available = [...chores];
    for (let chore of available) {
      // Frequency filter
      if (chore.frequency === "Monthly" && week % 4 !== 0) continue;
      if (chore.frequency === "Quarterly" && week % 12 !== 0) continue;

      // Assign to the person with the lowest load (but cap ~12)
      assignments.sort((a, b) => a.load - b.load);
      const target = assignments[0];
      if (target.load + chore.weight <= 12) {
        target.chores.push(chore);
        target.load += chore.weight;
      }
    }

    return assignments;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        Housemate Chore Balancer
      </h1>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 ${
            activeTab === "dashboard" ? "border-b-2 border-blue-600 font-semibold" : ""
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`px-4 py-2 ${
            activeTab === "edit" ? "border-b-2 border-blue-600 font-semibold" : ""
          }`}
        >
          Edit Chores
        </button>
      </div>

      {activeTab === "dashboard" ? (
        <div>
          {[1, 2, 3, 4].map((week) => {
            const assignments = generateAssignments(week);
            return (
              <div key={week} className="mb-6">
                <h2 className="font-semibold text-lg mb-2">Week {week}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {assignments.map((a) => (
                    <div
                      key={a.person}
                      className="p-4 border rounded shadow bg-white"
                    >
                      <h3 className="font-semibold">
                        {a.person}{" "}
                        <span className="text-sm text-gray-500">load {a.load}</span>
                      </h3>
                      <ul className="list-disc ml-5">
                        {a.chores.map((c, i) => (
                          <li key={i}>
                            {c.name} [{c.location}] (w{c.weight})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <h2 className="font-semibold mb-2">Add a Chore</h2>
          <ChoreForm onAdd={addChore} />
          <h2 className="font-semibold mt-6 mb-2">Chore List</h2>
          <ul>
            {chores.map((c, i) => (
              <li key={i}>
                {c.name} [{c.location}] (w{c.weight}) – {c.frequency}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Chore Form Component
function ChoreForm({ onAdd }: { onAdd: (c: Chore) => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [weight, setWeight] = useState(1);
  const [frequency, setFrequency] = useState<"Weekly" | "Monthly" | "Quarterly">(
    "Weekly"
  );

  const submit = () => {
    if (!name) return;
    onAdd({ name, location, weight, frequency });
    setName("");
    setLocation("");
    setWeight(1);
    setFrequency("Weekly");
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Chore name"
        className="border p-2 flex-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Location (e.g., Kitchen)"
        className="border p-2 flex-1"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        type="number"
        className="border p-2 w-16"
        value={weight}
        onChange={(e) => setWeight(parseInt(e.target.value))}
      />
      <select
        className="border p-2"
        value={frequency}
        onChange={(e) => setFrequency(e.target.value as any)}
      >
        <option value="Weekly">Weekly</option>
        <option value="Monthly">Monthly</option>
        <option value="Quarterly">Quarterly</option>
      </select>
      <button onClick={submit} className="bg-blue-600 text-white px-4 py-2">
        Add
      </button>
    </div>
  );
}


export default App;
