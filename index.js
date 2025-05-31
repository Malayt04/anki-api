import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import connectDB from './db.js'; 
import Subject from './models/Subject.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ANKI_URL = 'http://localhost:8765';

connectDB(); 

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callAnkiConnect(action, params = {}) {
  try {
    const response = await axios.post(ANKI_URL, {
      action,
      version: 6,
      params,
    });

    if (response.data.error) {
      throw new Error(`AnkiConnect error: ${response.data.error}`);
    }

    return response.data.result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

app.get('/:subject', async (req, res) => {
  const subject = req.params.subject;

  try {
    const noteIds = await callAnkiConnect('findNotes', {
      query: `deck:${subject}`,
    });

    if (!noteIds || noteIds.length === 0) {
      return res.status(404).json({ message: `No cards found for subject: ${subject}` });
    }

    await sleep(200);

    const notes = await callAnkiConnect('notesInfo', {
      notes: noteIds,
    });

    const questions = notes.map(note => ({
      question: note.fields?.Front?.value || '[No Front]',
      answer: note.fields?.Back?.value || '[No Back]',
    }));

    const saved = new Subject({ subject, questions });
    await saved.save();

    res.json({ subject, questions });
  } catch (err) {
    console.error('Error in /:subject route:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

