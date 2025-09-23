const app = require('./app');

const PORT = process.env.PORT || 4000;

async function connectDB() {
  // Database connection logic here
}

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error(error);
});