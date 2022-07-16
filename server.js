const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const notes = require('./db/notes.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/notes', (req, res) => {
    console.log(`Displaying saved notes...`)
    res.json(notes);
});

app.post('/api/notes', (req, res) => {
    console.log(`A new note was saved!`)

    let newNote = req.body;
    newNote.id = uuidv4();
    notes.push(newNote);
    fs.writeFileSync('./db/notes.json', JSON.stringify(notes), (err) => {
        if (err) throw err;
    });
    res.send(notes);
});

app.delete('/api/notes/:id', (req, res) => {
    console.log(`A saved note was deleted!`)
    notes.forEach((note, i) => {
        if (note.id === req.params.id) {
            notes.splice(i, 1)
        };
    });

    // db.splice(db.indexOf(req.params.id), 1);
    fs.writeFile("db/notes.json", JSON.stringify(notes), (err) => {
        if (err) throw err;
    });
    res.send(notes);
});

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.listen(PORT, () => {
    console.log(`API server now on ${PORT}`);
});