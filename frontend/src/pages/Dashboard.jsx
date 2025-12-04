import { useState, useEffect } from "react";
import { api } from "../api";

const Dashboard = () => {
  const [tab, setTab] = useState("create");
  const [teamName, setTeamName] = useState("");
  const [teamImage, setTeamImage] = useState("");
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadTeams();
    // decode token to get current user id (if token present)
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id || payload._id || null);
      }
    } catch (e) {
      // ignore
    }
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

  const acceptRequest = async (teamId, userId) => {
    try {
      await api.post(`/team/accept/${teamId}/${userId}`);
      alert("Request accepted");
      loadTeams();
    } catch (err) {
      alert("Error accepting request");
    }
  };

  const rejectRequest = async (teamId, userId) => {
    try {
      await api.post(`/team/reject/${teamId}/${userId}`);
      alert("Request rejected");
      loadTeams();
    } catch (err) {
      alert("Error rejecting request");
    }
  };

  return (
    <div className="p-8">

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b pb-3 text-xl">
        <button onClick={() => setTab("create")}>Create Team</button>
        <button onClick={() => setTab("join")}>Join Team</button>
        <button onClick={() => setTab("all")}>All Teams</button>
        <button onClick={() => setTab("requests")}>Requests</button>
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
                {/* show pending count if any */}
                {t.pendingRequests && t.pendingRequests.length > 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    Pending Requests: {t.pendingRequests.length}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REQUESTS (only for team owners) */}
      {tab === "requests" && (
        <div>
          <h2 className="text-2xl mb-3">Pending Join Requests</h2>

          <div className="space-y-4">
            {teams
              .filter((t) => t.pendingRequests && t.pendingRequests.length > 0)
              .map((t) => (
                <div key={t._id} className="p-4 shadow rounded bg-white">
                  <h3 className="text-lg font-bold">{t.teamName}</h3>
                  <p className="text-sm text-gray-600">Team ID: {t._id}</p>

                  {/* Only owner can accept/reject */}
                  {String(t.owner?._id || t.owner) === String(currentUserId) ? (
                    <div className="mt-3 space-y-2">
                      {t.pendingRequests.map((u) => (
                        <div key={u._id} className="flex items-center justify-between border p-2 rounded">
                          <div>
                            <div className="font-medium">{u.name || u.email}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              className="bg-green-600 text-white px-3 py-1 rounded"
                              onClick={() => acceptRequest(t._id, u._id)}
                            >
                              Accept
                            </button>
                            <button
                              className="bg-red-600 text-white px-3 py-1 rounded"
                              onClick={() => rejectRequest(t._id, u._id)}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">You are not the owner of this team.</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
