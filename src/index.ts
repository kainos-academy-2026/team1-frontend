import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.API_BASE_URL) {
	console.error('Error: API_BASE_URL environment variable is not set.');
	process.exit(1);
}

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
