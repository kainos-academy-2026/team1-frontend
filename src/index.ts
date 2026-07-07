import 'dotenv/config';
import { createApp } from './app';

const ensureRequiredConfig = () => {
	if (!process.env.API_BASE_URL) {
		throw new Error(
			'API_BASE_URL is required. Set it in your environment before starting the app.',
		);
	}
};

const PORT = Number(process.env.PORT) || 4000;
ensureRequiredConfig();
const app = createApp();

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
