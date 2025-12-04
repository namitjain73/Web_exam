import { useState, useEffect } from "react";
import { api } from "../api";

const Dashboard = () => {
  const [tab, setTab] = useState("create");
  const [teamName, setTeamName] = useState("");
  const [teamImage, setTeamImage] = useState("");
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      // FIXED ROUTE
      const res = await api.get("/team/mine");
      setTeams(res.data.teams);
    } catch (err) {
      console.log("Error loading teams");
    }
  };

  const createTeam = async () => {
    try {
      // FIXED ROUTE
      await api.post("/team/create", { teamName, teamImage });
      loadTeams();
    } catch (err) {
      alert("Could not create team");
    }
  };

  const joinTeam = async () => {
    try {
      // FIXED ROUTE
      await api.post(`/team/request/${teamId}`);
      alert("Request Sent");
    } catch (err) {
      alert("Error sending request");
    }
  };

  return (
    <div className="p-8">

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b pb-3 text-xl">
        <button onClick={() => setTab("create")}>Create Team</button>
        <button onClick={() => setTab("join")}>Join Team</button>
        <button onClick={() => setTab("all")}>All Teams</button>
      </div>

      {/* CREATE TEAM */}
      {tab === "create" && (
        <div className="w-80">
          <h2 className="text-2xl mb-3">Create Team</h2>

          <input 
            placeholder="Team Name" 
            className="w-full border p-2 mb-3"
            onChange={(e) => setTeamName(e.target.value)}
          />

          <input 
            placeholder="Team Image URL"
            className="w-full border p-2 mb-3"
            onChange={(e) => setTeamImage(e.target.value)}
          />

          <button 
            className="w-full bg-blue-600 text-white py-2 rounded"
            onClick={createTeam}
          >
            Create
          </button>
        </div>
      )}

      {/* JOIN TEAM */}
      {tab === "join" && (
        <div className="w-80">
          <h2 className="text-2xl mb-3">Join Team</h2>

          <input 
            placeholder="Team ID"
            className="w-full border p-2 mb-3"
            onChange={(e) => setTeamId(e.target.value)}
          />

          <button 
            className="w-full bg-green-600 text-white py-2 rounded"
            onClick={joinTeam}
          >
            Send Join Request
          </button>
        </div>
      )}

      {/* ALL TEAMS */}
      {tab === "all" && (
        <div>
          <h2 className="text-2xl mb-3">Your Teams</h2>

          <div className="grid grid-cols-3 gap-6">
            {teams.map((t) => (
              <div key={t._id} className="p-4 shadow rounded bg-white">
                <img 
                  src={t.teamImage || "https://via.placeholder.com/150"} 
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="text-lg font-bold mt-3">{t.teamName}</h3>
                <p className="text-sm text-gray-600 mt-1 break-all">
                  Team ID: {t._id}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
