import express from 'express';

const app = express();
app.get('/', (req, res) => res.send("Hello World!"));
app.listen(3000, () => console.log('listening on 3000'));

export default app;
