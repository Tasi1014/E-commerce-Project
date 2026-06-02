import 'dotenv/config'; 
import app from './app.js';
import { config } from './config/appConfig.js';
import "./Config/mongodbConfig.js"

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
