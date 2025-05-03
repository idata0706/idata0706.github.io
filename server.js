const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;


// Static folder for front-end
app.use(express.static(path.join(__dirname, 'src')));

// API endpoint to fetch filenames
app.get('/api/files', (req, res) => {
    const directorPath = path.join(__dirname, 'src/files'); //Adjut file path to correct folder
    
    console.log('Resolved Directory Path', directorPath);  // debugging
    
    
    fs.readdir(directorPath, (err,files) => {
        if (err) {
            console.error('Error reading directory:', err);
            res.status(500).send('Error reading directory');

        } else {
            res.json(files);
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});