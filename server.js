const app = require("./app");
const mongoose = require("mongoose");


// Open DB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/cat-gram");
const db = mongoose.connection;
db.on("error", error => {
	console.error("An error occurred!", error);
});

const server = app.listen(process.env.PORT || 3000, () => {
	console.log(`Listening on port ${server.address().port}...`);
});
