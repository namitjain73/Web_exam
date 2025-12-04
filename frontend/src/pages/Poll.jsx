import { useState } from "react";

export default function Poll() {
  const [options, setOptions] = useState([]);
  const [votes, setVotes] = useState([]);
  const [selected, setSelected] = useState([]); // MULTIPLE SELECT
  const [newOption, setNewOption] = useState("");
  const [result, setResult] = useState("");

  const toggleSelect = (index) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  };

  const handleVote = () => {
    if (selected.length === 0) return alert("Please select at least one option.");

    const updatedVotes = [...votes];
    selected.forEach(i => updatedVotes[i]++);
    setVotes(updatedVotes);
    setSelected([]); 
  };

  const showResult = () => {
    const maxVotes = Math.max(...votes);
    const winners = options.filter((opt, i) => votes[i] === maxVotes);

    setResult(
      winners.length > 1
        ? `Tie — selecting first: ${winners[0]}`
        : `Winner: 🎉 ${winners[0]}`
    );
  };

  const addOption = () => {
    if (!newOption.trim()) return alert("Destination cannot be empty!");

    setOptions([...options, newOption]);
    setVotes([...votes, 0]);
    setNewOption("");
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>Vote for your next trip destination</h2>

      <div style={styles.addSection}>
        <input
          type="text"
          placeholder="Enter new destination name"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          style={styles.input}
        />
        <button style={styles.addBtn} onClick={addOption}>Add</button>
      </div>

      {options.length > 0 ? (
        <>
          <p style={styles.subtext}>Select multiple destinations and submit your vote.</p>

          {options.map((option, index) => (
            <label key={index} style={styles.option}>
              <input
                type="checkbox"
                checked={selected.includes(index)}
                onChange={() => toggleSelect(index)}
              />
              {option}
            </label>
          ))}

          <div style={styles.btnGroup}>
            <button style={styles.voteBtn} onClick={handleVote}>Submit Vote</button>
            <button style={styles.resultBtn} onClick={showResult}>Show Result</button>
          </div>
        </>
      ) : (
        <p style={{ marginTop: 20, color: "gray" }}>Add destinations to begin voting.</p>
      )}

      <div style={styles.results}>
        {options.map((opt, i) => (
          <p key={i}>{opt}: {votes[i]} vote(s)</p>
        ))}
      </div>

      {result && <h3 style={styles.resultText}>{result}</h3>}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    width: "60%",
    margin: "auto",
    marginTop: "50px",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
  },
  heading: { fontSize: "26px", fontWeight: "bold" },
  subtext: { marginTop: "10px", fontSize: "16px" },
  option: { display: "block", marginTop: "12px", fontSize: "18px" },
  btnGroup: { display: "flex", gap: "15px", marginTop: "20px" },
  voteBtn: {
    background: "#2563eb", color: "#fff",
    padding: "10px 20px",
    borderRadius: "6px", border: "none", cursor: "pointer"
  },
  resultBtn: {
    background: "#ddd", padding: "10px 20px", borderRadius: "6px", cursor: "pointer"
  },
  addSection: { display: "flex", gap: "10px", marginTop: "10px" },
  input: {
    flex: 1, padding: "10px",
    borderRadius: "6px", border: "1px solid #ccc"
  },
  addBtn: {
    background: "#2563eb",
    padding: "10px 20px",
    color: "#fff",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  },
  results: { marginTop: "20px", fontSize: "16px" },
  resultText: { marginTop: "15px", fontSize: "20px", fontWeight: "bold", color: "green" }
};
