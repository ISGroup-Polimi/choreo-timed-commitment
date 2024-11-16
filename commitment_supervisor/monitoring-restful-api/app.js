const connectDB = require('./database');
const express = require('express');


connectDB();


const app = express();
const port = 3000;

// Importa i router
const supervisorRouter = require('./routes/supervisor');
const commitmentRouter = require('./routes/commitment');

app.use(express.json());

// Utilizza i router
app.use('/api/supervisor', supervisorRouter);
app.use('/api/commitment', commitmentRouter);

app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
