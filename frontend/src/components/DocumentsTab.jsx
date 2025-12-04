import { useState, useEffect } from "react";
import api from "../utils/api";
import { FiPlus, FiFile, FiTrash2, FiDownload } from "react-icons/fi";
import "./DocumentsTab.css";

const DocumentsTab = ({ trip, onUpdate }) => {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "other",
    fileUrl: "",
    fileType: "application/pdf",
    activityId: ""
  });

  useEffect(() => {
    fetchDocuments();
  }, [trip._id]);

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/documents/trip/${trip._id}`);
      setDocuments(response.data.documents);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/documents", {
        tripId: trip._id,
        name: formData.name,
        type: formData.type,
        fileUrl: formData.fileUrl,
        fileType: formData.fileType,
        activityId: formData.activityId || undefined
      });

      setShowForm(false);
      setFormData({
        name: "",
        type: "other",
        fileUrl: "",
        fileType: "application/pdf",
        activityId: ""
      });
      fetchDocuments();
      onUpdate();
    } catch (err) {
      console.error("Error uploading document:", err);
      alert(err.response?.data?.message || "Error uploading document");
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/documents/${documentId}`);
      fetchDocuments();
      onUpdate();
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    const type = doc.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {});

  return (
    <div className="documents-tab">
      <div className="documents-header">
        <h2>Document Vault</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <FiPlus /> Upload Document
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Document</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Document Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="ticket">Ticket</option>
                  <option value="voucher">Voucher</option>
                  <option value="id">ID Document</option>
                  <option value="receipt">Receipt</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>File URL</label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, fileUrl: e.target.value })
                  }
                  placeholder="https://example.com/document.pdf"
                  required
                />
                <small>Note: For production, implement file upload to cloud storage</small>
              </div>
              <div className="form-group">
                <label>File Type</label>
                <select
                  value={formData.fileType}
                  onChange={(e) =>
                    setFormData({ ...formData, fileType: e.target.value })
                  }
                >
                  <option value="application/pdf">PDF</option>
                  <option value="image/jpeg">JPEG Image</option>
                  <option value="image/png">PNG Image</option>
                  <option value="application/msword">Word Document</option>
                </select>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="documents-list">
        {documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents yet. Upload your first document!</p>
          </div>
        ) : (
          Object.entries(groupedDocuments).map(([type, docs]) => (
            <div key={type} className="document-group">
              <h3 className="document-type-header">
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </h3>
              <div className="document-grid">
                {docs.map((doc) => (
                  <div key={doc._id} className="document-card">
                    <div className="document-icon">
                      <FiFile />
                    </div>
                    <div className="document-info">
                      <h4>{doc.name}</h4>
                      <p className="document-meta">
                        Uploaded by {doc.uploadedBy.name}
                      </p>
                      <p className="document-date">
                        {new Date(doc.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="document-actions">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon-btn"
                      >
                        <FiDownload />
                      </a>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="icon-btn"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsTab;

