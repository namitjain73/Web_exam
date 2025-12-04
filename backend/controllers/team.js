import Team from "../models/Team.js";
import User from "../models/User.js";

// -----------------------------
// CREATE TEAM
// -----------------------------
export const createTeam = async (req, res) => {
    console.log("creating")
    try {
        const { teamName, teamImage } = req.body;

        if (!teamName)
            return res.status(400).json({ message: "Team name required" });
        console.log(teamName)
        const team = await Team.create({
            teamName,
            teamImage: teamImage || "",
            owner: req.user,
            members: [req.user]
        });
        console.log(team)
        return res.json({
            message: "Team created",
            team
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// -----------------------------
// REQUEST TO JOIN TEAM
// -----------------------------
export const requestToJoin = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (team.members.includes(req.user))
            return res.status(400).json({ message: "Already a member" });

        if (team.pendingRequests.includes(req.user))
            return res.status(400).json({ message: "Already requested" });

        team.pendingRequests.push(req.user);
        await team.save();

        return res.json({ message: "Join request sent" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// -----------------------------
// ACCEPT MEMBER REQUEST
// -----------------------------
export const acceptRequest = async (req, res) => {
    try {
        const { teamId, userId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (String(team.owner) !== String(req.user))
            return res.status(403).json({ message: "Only owner can accept" });

        if (!team.pendingRequests.includes(userId))
            return res.status(400).json({ message: "No such request" });

        // Remove from pending
        team.pendingRequests = team.pendingRequests.filter(
            (u) => String(u) !== String(userId)
        );

        // Add to members
        team.members.push(userId);

        await team.save();

        return res.json({ message: "Request accepted" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// -----------------------------
// REJECT MEMBER REQUEST
// -----------------------------
export const rejectRequest = async (req, res) => {
    try {
        const { teamId, userId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (String(team.owner) !== String(req.user))
            return res.status(403).json({ message: "Only owner can reject" });

        team.pendingRequests = team.pendingRequests.filter(
            (u) => String(u) !== String(userId)
        );

        await team.save();

        return res.json({ message: "Request rejected" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// -----------------------------
// GET ALL TEAMS WHERE USER BELONGS
// -----------------------------
export const getMyTeams = async (req, res) => {
    try {
        const userId = req.user; // FIXED — use req.user (string), not req.user.id

        const teams = await Team.find({ members: userId })
            .populate("owner", "name email")
            .populate("members", "name email")
            .populate("pendingRequests", "name email");


        return res.json({ teams });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

