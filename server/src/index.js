import { initDb } from './db/index.js';
import app from './app.js';

const PORT = process.env.PORT || 3001;

initDb();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
