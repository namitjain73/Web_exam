import { useState, useEffect } from "react";
import { api } from "../api";

const Dashboard = () => {
  const [tab, setTab] = useState("create");
  const [teamName, setTeamName] = useState("");
  const [teamImage, setTeamImage] = useState("");
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [docUrl, setDocUrl] = useState("");
  const [docName, setDocName] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptionsText, setPollOptionsText] = useState("");

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

  const loadTeamDetails = async (teamId) => {
    try {
      const res = await api.get(`/team/${teamId}`);
      setSelectedTeam(res.data.team);
    } catch (err) {
      alert("Error loading team details");
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

  const addDocumentToTeam = async (teamId) => {
    try {
      await api.post(`/team/${teamId}/document`, { url: docUrl, name: docName });
      setDocUrl("");
      setDocName("");
      await loadTeamDetails(teamId);
      loadTeams();
    } catch (err) {
      alert("Error adding document");
    }
  };

  const createPollForTeam = async (teamId) => {
    try {
      const options = pollOptionsText.split(";").map((s) => s.trim()).filter(Boolean);
      await api.post(`/team/${teamId}/poll`, { question: pollQuestion, options });
      setPollQuestion("");
      setPollOptionsText("");
      await loadTeamDetails(teamId);
    } catch (err) {
      alert("Error creating poll");
    }
  };

  const votePollOption = async (teamId, pollId, optionIndex) => {
    try {
      await api.post(`/team/${teamId}/poll/${pollId}/vote`, { optionIndex });
      await loadTeamDetails(teamId);
    } catch (err) {
      alert("Error voting");
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
                <div className="mt-3 flex gap-2">
                  <button className="bg-gray-200 px-2 py-1 rounded" onClick={() => loadTeamDetails(t._id)}>View Details</button>
                </div>
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

      {/* TEAM DETAILS */}
      {selectedTeam && (
        <div className="mt-6">
          <h2 className="text-2xl mb-3">{selectedTeam.teamName} — Details</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-white shadow rounded">
              <h3 className="font-bold">Destination</h3>
              <p className="text-sm mt-1">{selectedTeam.destination || "(not set)"}</p>

              <h3 className="font-bold mt-4">Members</h3>
              <ul className="mt-2 space-y-1">
                {selectedTeam.members.map((m) => (
                  <li key={m._id} className="text-sm">{m.name} — {m.email}</li>
                ))}
              </ul>

              <h3 className="font-bold mt-4">Pending Requests</h3>
              <ul className="mt-2 space-y-1">
                {selectedTeam.pendingRequests.map((r) => (
                  <li key={r._id} className="text-sm">{r.name} — {r.email}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-white shadow rounded">
              <h3 className="font-bold">Documents</h3>
              <ul className="mt-2 space-y-2">
                {selectedTeam.documents && selectedTeam.documents.length > 0 ? (
                  selectedTeam.documents.map((d, i) => (
                    <li key={i} className="text-sm">
                      <a className="text-blue-600" href={d.url} target="_blank" rel="noreferrer">{d.name || d.url}</a>
                      <div className="text-xs text-gray-500">Uploaded by: {d.uploadedBy?.name || d.uploadedBy?.email}</div>
                    </li>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No documents</div>
                )}
              </ul>

              <div className="mt-4">
                <h4 className="font-medium">Add Document (URL)</h4>
                <input className="w-full border p-2 mt-2" placeholder="Document name" value={docName} onChange={(e)=>setDocName(e.target.value)} />
                <input className="w-full border p-2 mt-2" placeholder="Document URL" value={docUrl} onChange={(e)=>setDocUrl(e.target.value)} />
                <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded" onClick={() => addDocumentToTeam(selectedTeam._id)}>Add Document</button>
              </div>
            </div>

            <div className="p-4 bg-white shadow rounded">
              <h3 className="font-bold">Polls</h3>
              <div className="space-y-3 mt-2">
                {selectedTeam.polls && selectedTeam.polls.length > 0 ? (
                  selectedTeam.polls.map((p) => (
                    <div key={p._id} className="p-2 border rounded">
                      <div className="font-medium">{p.question}</div>
                      <div className="text-xs text-gray-500">By: {p.createdBy?.name || p.createdBy?.email}</div>
                      <div className="mt-2 space-y-1">
                        {p.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="text-sm">{opt.text}</div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-600">{opt.votes?.length || 0}</div>
                              <button className="bg-green-600 text-white px-2 py-1 rounded text-xs" onClick={() => votePollOption(selectedTeam._id, p._id, idx)}>Vote</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No polls</div>
                )}

                <div className="mt-4">
                  <h4 className="font-medium">Create Poll</h4>
                  <input className="w-full border p-2 mt-2" placeholder="Question" value={pollQuestion} onChange={(e)=>setPollQuestion(e.target.value)} />
                  <input className="w-full border p-2 mt-2" placeholder="Options (separate with ; )" value={pollOptionsText} onChange={(e)=>setPollOptionsText(e.target.value)} />
                  <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded" onClick={() => createPollForTeam(selectedTeam._id)}>Create Poll</button>
                </div>
              </div>

              <h3 className="font-bold mt-4">Activity Logs</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {selectedTeam.activityLogs && selectedTeam.activityLogs.length > 0 ? (
                  selectedTeam.activityLogs.map((l, i) => (
                    <li key={i}>{l.message} — {l.by?.name || l.by?.email} <span className="text-xs text-gray-400">({new Date(l.at).toLocaleString()})</span></li>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No recent activity</div>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => setSelectedTeam(null)}>Close Details</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
