#!/usr/bin/env node

const axios = require('axios');

async function syncTransmission() {
  try {
    console.log(`[${new Date().toISOString()}] Démarrage synchronisation Transmission...`);
    
    const response = await axios.post('http://localhost:3000/api/transmission/sync', {}, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log(`[${new Date().toISOString()}] Synchronisation réussie:`, response.data.message);
    } else {
      console.error(`[${new Date().toISOString()}] Erreur synchronisation:`, response.status, response.statusText);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erreur synchronisation:`, error.message);
  }
}

// Lancer la synchronisation
syncTransmission();
