const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

const logger = require('./utils/logger');

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
