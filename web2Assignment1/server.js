const http = require('http');
const fs = require('fs');

const PORT = 3000;
const FILE_PATH = './movies.json';

// Read movies from file
const readMovies = (callback) => {
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            callback([]);
        } else {
            callback(JSON.parse(data || '[]'));
        }
    });
};

// Write movies to file
const writeMovies = (movies, callback) => {
    fs.writeFile(FILE_PATH, JSON.stringify(movies, null, 2), callback);
};

const server = http.createServer((req, res) => {

    // GET all movies
    if (req.method === 'GET' && req.url === '/movies') {

        readMovies((movies) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(movies));
        });
    }

    // GET movie by ID
    else if (req.method === 'GET' && req.url.startsWith('/movies/')) {

        const id = parseInt(req.url.split('/')[2]);

        readMovies((movies) => {

            const movie = movies.find(m => m.id === id);

            if (!movie) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({ message: 'Movie not found' }));
                return;
            }

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(movie));
        });
    }

    // POST new movie
    else if (req.method === 'POST' && req.url === '/movies') {

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            const newMovie = JSON.parse(body);

            readMovies((movies) => {

                newMovie.id = movies.length + 1;

                movies.push(newMovie);

                writeMovies(movies, (err) => {

                    if (err) {
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({ message: 'Error saving movie' }));
                        return;
                    }

                    res.writeHead(201, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(newMovie));
                });
            });
        });
    }

    // PUT update movie
    else if (req.method === 'PUT' && req.url.startsWith('/movies/')) {

        const id = parseInt(req.url.split('/')[2]);

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            const updatedData = JSON.parse(body);

            readMovies((movies) => {

                const index = movies.findIndex(m => m.id === id);

                if (index === -1) {
                    res.writeHead(404, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ message: 'Movie not found' }));
                    return;
                }

                movies[index] = {
                    ...movies[index],
                    ...updatedData
                };

                writeMovies(movies, (err) => {

                    if (err) {
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({ message: 'Error updating movie' }));
                        return;
                    }

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(movies[index]));
                });
            });
        });
    }

    // DELETE movie
    else if (req.method === 'DELETE' && req.url.startsWith('/movies/')) {

        const id = parseInt(req.url.split('/')[2]);

        readMovies((movies) => {

            const filteredMovies = movies.filter(m => m.id !== id);

            writeMovies(filteredMovies, (err) => {

                if (err) {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ message: 'Error deleting movie' }));
                    return;
                }

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({ message: 'Movie deleted successfully' }));
            });
        });
    }

    // Route not found
    else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});