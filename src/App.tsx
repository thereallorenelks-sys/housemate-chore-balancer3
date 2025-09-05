import React, { useState, useEffect } from "react";

type Chore = {
  id: number;
  name: string;
  location: string;
  weight: number;
  frequency: string;
};

const App: React.FC = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [weight, setWeight] = useState(1);
  const [frequency, setFrequency] = useState("weekly");

  useEffect(() => {
    const saved = localStorage.getItem("chores");
    if (saved) setChores(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chores", JSON.stringify(chores));
  }, [chores]);

  const addChore = () => {
    if (!name.trim()) return;
    const newChore: Chore = {
      id: Date.now(),
      name,
      location,
      weight,
      frequency,
    };
    setChores([...chores, newChore]);
    setName("");
    setLocation("");
    setWeight(1);
    setFrequency("weekly");
  };

  const removeChore = (id: number) => {
    setChores(chores.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        Housemate Chore Balancer (Editable)
      </h1>

      <div className="mb-6 p-4 border rounded shadow bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Add a Chore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Chore name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Location (e.g., Kitchen)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Weight (1–5)"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="border p-2 rounded"
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
        <button
          onClick={addChore}
          className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Chore
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Chore List</h2>
        {chores.length === 0 && <p>No chores added yet.</p>}
        <ul className="space-y-2">
          {chores.map((chore) => (
            <li
              key={chore.id}
              className="flex justify-between items-center border p-2 rounded bg-white shadow"
            >
              <span>
                {chore.name} [{chore.location}] (w{chore.weight}, {chore.frequency})
              </span>
              <button
                onClick={() => removeChore(chore.id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;