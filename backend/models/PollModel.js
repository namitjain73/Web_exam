/**
 * Placeholder for a Poll Model.
 * In a traditional MongoDB or PostgreSQL environment, this file would define 
 * the structure and validation for the 'Poll' data object.
 * * Since we are using Firebase/Firestore (a NoSQL document database), 
 * the structure is defined implicitly by the JavaScript objects sent from 
 * the frontend, as seen in frontend/src/firebaseService.js.
 */
class Poll {
  constructor(question, options, createdBy, status = 'open', selectedPlace = null) {
    this.question = question;
    this.options = options.map(name => ({
      name,
      votes: 0,
      voters: []
    }));
    this.createdBy = createdBy;
    this.status = status;
    this.selectedPlace = selectedPlace;
    this.createdAt = new Date().toISOString();
  }
}

// Exporting a class is typical for models, even if not directly used in the Firebase structure.
module.exports = Poll;