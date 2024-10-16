const request = require("supertest");
const { app } = require("../index.js");
const { validateUser, validateBook, validateReview } = require("../index.js");
const http = require("http");
const { describe, beforeEach } = require("node:test");

jest.mock("../index.js", () => {
  const actualModule = jest.requireActual("../index.js");
  return {
    ...actualModule,
    validateUser: jest.fn(),
    validateBook: jest.fn(),
    validateReview: jest.fn(),
  };
});

let server;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(3001, done);
});

afterAll((done) => {
  server.close(done);
});

describe("API Endpoints to add data", () => {
 beforeEach(() => {
   jest.clearAllMocks();
 });
 
 it("Should add a new user with valid input", async () => {
  const response = await request(server)
  .post("/api/users")
  .send({name: "John Doe", email: "johndoe@gmail.com"});

  expect(response.statusCode).toEqual(201);
  expect(response.body).toEqual({
    id: 1, name: "John Doe", 
    email: "johndoe@gmail.com",
  });
 });

 it("Should return 400 for invalid user input", async () => {
  const response = await request(server).post("/api/users").send({name: "John Doe"});

  expect(response.statusCode).toEqual(400);
  expect(response.text).toEqual("Email is required and should be a string.")
 });

 it("Should add a new book with valid input", async () => {
   const response = await request(server).post("/api/books").send({title: "Harry Potter", author: "J.K Rowling"});

   expect(response.statusCode).toEqual(201);
   expect(response.body).toEqual({
    id: 1, 
    title: "Harry Potter", 
    author: "J.K Rowling"
   });
 });

 it("Should return 400 for invalid book input", async () => {
   const response = await request(server).post("/api/books").send({title: "Harry Potter"});

   expect(response.statusCode).toEqual(400);
   expect(response.text).toEqual("Author is required and should be a string.");
 });

 it("Should add a new review with valid input", async () => {
   const response = await request(server).post("/api/reviews").send({content: "Very good", userId: 3}); 

   expect(response.statusCode).toEqual(201);
   expect(response.body).toEqual({id: 1, content: "Very good", userId: 3});
 });

 it("Should return 400 for invalid review input", async () => {
  const response = await request(server).post("/api/reviews").send({content: "Very good"});

  expect(response.statusCode).toEqual(400);
  expect(response.text).toEqual("User Id is required and should be a number");
 });
});

describe("Validation Functions Test", () => {
  it("Should validate user input correctly", () => {
    validateUser.mockReturnValue(null);
    expect(validateUser({ name: "John", email: "johndoe@gmail.com" })).toBeNull(); 

    validateUser.mockReturnValue("Email is required and should be a string.");
    expect(validateUser({ name: "John" })).toEqual("Email is required and should be a string.");

    validateUser.mockReturnValue("Name is required and should be a string.");
    expect(validateUser({ email: "johndoe@gmail.com" })).toEqual("Name is required and should be a string.");
  });
  
  it("Should validate book input correctly", () => {
    validateBook.mockReturnValue(null);
    expect(validateBook({title: "The Great Gatsby", author: "F Scott Fitzgerald"})).toBeNull();

    validateBook.mockReturnValue("Author is required and should be a string.");
    expect(validateBook({title: "The Great Gatsby"})).toEqual("Author is required and should be a string.");

    validateBook.mockReturnValue("Title is required and should be a string.");
    expect(validateBook({author: "J.K. Rowling"})).toEqual("Title is required and should be a string.");
  });
  
  it("Should validate review input correctly", () => {
    validateReview.mockReturnValue(null); 
    expect(validateReview({content: "Very good", userId: 1})).toBeNull();

    validateReview.mockReturnValue("User Id is required and should be a number");
    expect(validateReview({content: "Very good"})).toBe("User Id is required and should be a number");

    validateReview.mockReturnValue("Content is required and should be a string.");
    expect(validateReview({userId: 1})).toBe("Content is required and should be a string.");
  });
});
