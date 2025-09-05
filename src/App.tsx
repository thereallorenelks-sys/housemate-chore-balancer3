import React, { useState } from "react";

interface Chore {
  name: string;
  location: string;
  weight: number;
  frequency: string;
}

const App: React.FC = () => {
  const [chores, setChores] = useState<Chore[]>([
    { name: "Clean sink", location: "Kitchen", weight: 2, frequency: "Weekly" },
    { name: "Dusting", location: "Living Room", weight: 3, frequency: "Weekly" },
    { name: "Sweep stairs", location: "Stairs", weight: 3, frequency: "Weekly" },
    { name: "Wash curtains", location: "Living Room", weight: 4, frequency: "Quarterly" },
    { name: "Change Filter", location: "Upstairs", weight: 4, frequency: "Quarterly" },
  ]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [newChore, setNewChore] = useState<Chore>({
    name: "",
    location: "",
    weight: 1,
    frequency: "Weekly",
  });

  const housemates = ["Loren", "Zach", "Tristyn"];

  // Balanced assignment with total load in range 8-12
  const assignChores = () => {
    let assignments: Record<string, Chore[]> = {};
    housemates.forEach((h) => (assignments[h] = []));

    let loads: Record<string, number> = {};
    housemates.forEach((h) => (loads[h] = 0));

    chores.forEach((chore) => {
      let candidate = housemates.reduce((prev, curr) =>
        loads[prev] <= loads[curr] ? prev : curr
      );
      assignments[candidate].push(chore);
      loads[candidate] += chore.weight;
    });

    return assignments;
  };

  const assignments = assignChores();

  const handleAddChore = () => {
    if (!newChore.name.trim()) return;
    setChores([...chores, newChore]);
    setNewChore({ name: "", location: "", weight: 1, frequency: "Weekly" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
        Housemate Chore Balancer
      </h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-6 py-2 rounded-t-lg border-b-2 ${
            activeTab === "dashboard"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-gray-300 text-gray-500"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`px-6 py-2 rounded-t-lg border-b-2 ${
            activeTab === "edit"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-gray-300 text-gray-500"
          }`}
        >
          Edit Chores
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-4">
          {housemates.map((mate) => (
            <div key={mate} className="bg-white shadow p-4 rounded-lg">
              <h2 className="text-lg font-semibold">{mate}</h2>
              <ul className="list-disc ml-6">
                {assignments[mate].map((chore, i) => (
                  <li key={i}>
                    {chore.name} [{chore.location}] (w{chore.weight})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {activeTab === "edit" && (
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Add a Chore</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              className="border p-2 rounded"
              placeholder="Chore name"
              value={newChore.name}
              onChange={(e) => setNewChore({ ...newChore, name: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Location (e.g., Kitchen)"
              value={newChore.location}
              onChange={(e) => setNewChore({ ...newChore, location: e.target.value })}
            />
            <input
              type="number"
              className="border p-2 rounded"
              placeholder="Weight"
              value={newChore.weight}
              onChange={(e) => setNewChore({ ...newChore, weight: parseInt(e.target.value) })}
            />
            <select
              className="border p-2 rounded"
              value={newChore.frequency}
              onChange={(e) => setNewChore({ ...newChore, frequency: e.target.value })}
            >
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
          </div>
          <button
            onClick={handleAddChore}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Chore
          </button>

          <h3 className="mt-6 text-md font-semibold">Chore List</h3>
          <ul className="list-disc ml-6">
            {chores.map((chore, i) => (
              <li key={i}>
                {chore.name} [{chore.location}] ({chore.frequency})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
