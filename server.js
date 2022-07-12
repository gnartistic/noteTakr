const express = require('express');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3001;
const { notes } = require('./data/notes');
const app = express();

// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());

function filterByQuery(query, notesArray) {
    let filteredResults = notesArray;
    if (query.title) {
        filteredResults = filteredResults.filter(notes => notes.title === query.title);
    }
    if (query.text) {
        filteredResults = filteredResults.filter(notes => notes.text === query.text);
    }
    if (query.index) {
        filteredResults = filteredResults.filter(notes => notes.index === query.index);
    }
    return filteredResults;
}

function findByIndex(index, notesArray) {
    const result = notesArray.filter(notes => notes.index === index)[0];
    return result;
}

function createNewNote(body, notesArray) {
    const note = body;

    notesArray.push(note);
    fs.writeFileSync(
        path.join(__dirname, './data/notes.json'),
        JSON.stringify({ notes: notesArray }, null, 2)
    );
    return note;
}

function validateNote(note) {
    if (!note.title || typeof note.title !== 'string') {
        return false;
    }
    if (!note.text || typeof note.text !== 'string') {
        return false;
    }
    if (!note.index || typeof note.index !== 'string') {
        return false;
    }

    return true;
}

app.get('/api/notes', (req, res) => {
    let results = notes;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/notes/:index', (req, res) => {
    const result = findByIndex(req.params.index, notes);
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(404);
    }
});

app.post('/api/notes', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.index = notes.length.toString();
    // if any data in req.body is incorrect, send 400 error back
    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted.');
    } else {
        const note = createNewNote(req.body, notes);
        res.json(note);
    }
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});