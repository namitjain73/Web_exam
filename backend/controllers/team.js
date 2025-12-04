import Team from "../models/Team.js";
import User from "../models/User.js";
import mongoose from "mongoose";

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


// -----------------------------
// GET TEAM DETAILS
// -----------------------------
export const getTeamDetails = async (req, res) => {
    try {
        const { teamId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(teamId))
            return res.status(400).json({ message: "Invalid team id" });

        const team = await Team.findById(teamId)
            .populate("owner", "name email")
            .populate("members", "name email")
            .populate("pendingRequests", "name email")
            .populate("documents.uploadedBy", "name email")
            .populate("polls.createdBy", "name email")
            .populate("activityLogs.by", "name email");

        if (!team) return res.status(404).json({ message: "Team not found" });

        return res.json({ team });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// -----------------------------
// ADD DOCUMENT (simple URL-based)
// -----------------------------
export const addDocument = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { url, name } = req.body;

        if (!url) return res.status(400).json({ message: "Document URL required" });

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        // Only members can upload
        if (!team.members.map(String).includes(String(req.user)))
            return res.status(403).json({ message: "Only team members can upload documents" });

        team.documents.push({ name: name || "Document", url, uploadedBy: req.user });
        team.activityLogs.push({ message: `Document added: ${name || url}`, by: req.user });

        await team.save();

        return res.json({ message: "Document added" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// -----------------------------
// CREATE POLL
// -----------------------------
export const createPoll = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { question, options } = req.body; // options = [string]

        if (!question || !options || !Array.isArray(options) || options.length < 2)
            return res.status(400).json({ message: "Question and at least two options required" });

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        team.polls.push({
            question,
            options: options.map((o) => ({ text: o, votes: [] })),
            createdBy: req.user
        });

        team.activityLogs.push({ message: `Poll created: ${question}`, by: req.user });

        await team.save();

        return res.json({ message: "Poll created" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// -----------------------------
// VOTE POLL
// -----------------------------
export const votePoll = async (req, res) => {
    try {
        const { teamId, pollId } = req.params;
        const { optionIndex } = req.body; // integer

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        const poll = team.polls.id(pollId);
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        // remove user from all option votes
        poll.options.forEach((opt) => {
            opt.votes = opt.votes.filter((u) => String(u) !== String(req.user));
        });

        // add user to chosen option
        if (poll.options[optionIndex]) {
            poll.options[optionIndex].votes.push(req.user);
        } else {
            return res.status(400).json({ message: "Invalid option" });
        }

        team.activityLogs.push({ message: `Voted on poll: ${poll.question}`, by: req.user });

        await team.save();

        return res.json({ message: "Voted" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

