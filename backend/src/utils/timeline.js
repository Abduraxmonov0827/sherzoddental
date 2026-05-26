const { query } = require('../config/db');

async function addTimelineEvent(patientId, eventType, title, description = null, metadata = {}) {
  await query(
    `INSERT INTO timeline_events (patient_id, event_type, title, description, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [patientId, eventType, title, description, JSON.stringify(metadata)]
  );
}

module.exports = { addTimelineEvent };
