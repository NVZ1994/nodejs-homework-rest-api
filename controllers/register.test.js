/*
Unit tests for register controller
1. Given password - string and email - string.
2. Should return response with status code 200 and object user with two fields email and subscription, both string and generated avatarURL as string

CORRECT CASE:
request:
{
    "email": "email@email.com",
    "password": "password"
}

response:
{
    "user": {
        "email": "email@email.com",
        "subscription": "starter",
        "avatarURL": "//www.gravatar.com/avatar/4f64c9f81bb0d4ee969aaf7b4a5a6f40"
    }
}
*/

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const { PORT, DB_HOST_TEST } = process.env;

const UserModel = require("../models/userModel");

describe("test register controller", () => {
  let server = null;
  beforeAll(async () => {
    await mongoose.connect(DB_HOST_TEST);
    server = app.listen(PORT);
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  test("should register a new user", async () => {
    const registerData = {
      email: "email@email.com",
      password: "password",
    };

    const { body, statusCode } = await request(app)
      .post("/users/register")
      .send(registerData);

    expect(statusCode).toBe(201);
    expect(body).toEqual({
      user: {
        email: registerData.email,
        subscription: "starter",
        avatarURL: "//www.gravatar.com/avatar/4f64c9f81bb0d4ee969aaf7b4a5a6f40",
      },
    });

    const user = await UserModel.findOne({ email: registerData.email });
    expect(user.email).toBe(registerData.email);
    expect(user.subscription).toBe("starter");
    expect(user.avatarURL).toBe(
      "//www.gravatar.com/avatar/4f64c9f81bb0d4ee969aaf7b4a5a6f40"
    );
  });
});
