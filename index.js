require('dotenv').config();
const express = require('express');
const { db_controller } = require('./controllers/db_controller');
const app = express();
const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 80;

app.use(express.json())

app.post("/api/user", async (request, response) => {
    let data = request.body;
    let result = await db_controller.create_user(data);
    response.sendStatus(result);
});

app.post("/api/login", async (request, response) => {
    let data = request.body;
    let result = await db_controller.login(data);
    if (result != 401) {
        response.json(result);
    } else {
        response.sendStatus(result);
    }
});

app.get("/api/preference", async (request, response) => {
    let result = await db_controller.get_all_preferences();
    if (result != 400) {
        response.json(result);
    } else {
        response.sendStatus(400);
    }
});

app.post("/api/preference", async (request, response) => {
    let data = request.body;
    let result = await db_controller.add_preference(data);
    response.sendStatus(result);
});

app.put("/api/preference", async (request, response) => {
    let data = request.body;
    let result = await db_controller.change_preference(data);
    response.sendStatus(result);
});

app.get("/api/vacation", async (request, response) => {
    let result = await db_controller.vacation();
    if (result != 400) {
        response.json(result);
    } else {
        response.sendStatus(400);
    }
});

app.listen(port, host, () => {
    console.log(`Server listens http://${host}:${port}`);
});