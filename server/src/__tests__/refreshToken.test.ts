require("dotenv").config();
import { request } from "graphql-request";
import { User } from "../entities/User";
import { 
  HOST, 
} from "../constants";
import { connectDb } from "./utils/connectDb";
import {
  REGISTER_MUTATION, 
  REGISTER_EMAIL,
} from "../../src/constants";
import { MeQueryResponse, RegisterResponse } from "../types";
import { ColorLog, logJson, createMeQuery } from "../__tests__/utils/helpers";

const {
  NOT_FOUND_EMAIL,
  NOT_MY_EMAIL
} = process.env;

let connection;
const logger = ColorLog;
let newToken: string = "";
let userEmail: string = "";

const {
  EXPIRED_TOKEN
} = process.env;

describe("Tests the user register", () => {
  it("get expected response from the register mutation", async () => {
    new logger("purple", "registering a new user").genLog();
    const res: RegisterResponse = await request(HOST + "/graphql", REGISTER_MUTATION);
    logJson(res);
    console.log('user', res);

    
    expect(res.register.token).toBeTruthy();
    expect(typeof res.register.user.id).toBe("number");
    userEmail = res.register.user.email;
    newToken = res.register.token;
    expect(res.register.errors).toBeNull();
    expect(res.register.user.email).toEqual(REGISTER_EMAIL);
  });
  
  it("and check that the user got added to the db", async () => {
    new logger("purple", "checking that the user got added to the DB").genLog();
    connection = await connectDb();
    const users = await User.find({ where: { email: REGISTER_EMAIL }});
    logJson(users);
    expect(users).toHaveLength(1);
    connection.close();
  });

  it("checks if we try to register with the same credentials it returns an error", async () => {
    new logger("purple", "trying to register the same user credentials").genLog();
    const res: RegisterResponse = await request(HOST + "/graphql", REGISTER_MUTATION);
    logJson(res);
    expect(res.register.errors).toHaveLength(1);
  });

  it("checks the me query is returning the unauthenticated error", async () => {
    //expired or unauthenticated token test
    const invalidToken: MeQueryResponse = await request(HOST + "/graphql", `${createMeQuery(userEmail)}`, {}, {
      "authorization": `Bearer asdfasdf`
    });
    console.log("invalidToken with invalidToken token", invalidToken);
    expect(invalidToken.me.errors).toHaveLength(1);
    expect(invalidToken.me.errors[0].message).toBe("401 user not authenticated");
  });
  it("checks the me query is returning the unauthenticated error", async () => {
    //expired or unauthenticated token test
    const expired: MeQueryResponse = await request(HOST + "/graphql", `${createMeQuery(userEmail)}`, {}, {
      "authorization": `Bearer ${EXPIRED_TOKEN}`
    });
    console.log("expired with expired token", expired);
    expect(expired.me.errors).toHaveLength(1);
    expect(expired.me.errors[0].message).toBe("401 user not authenticated");
  });
  
  it("checks the user me query is returning the not found error", async () => {
    const notFound: MeQueryResponse = await request(HOST + "/graphql", `${createMeQuery(NOT_FOUND_EMAIL as string)}`, {}, {
      "authorization": `Bearer ${newToken}`
    });
    console.log("user not found", notFound);
    expect(notFound.me.errors).toHaveLength(1);
    expect(notFound.me.errors[0].message).toBe("404 user not found");
  });
  
  it("checks the user me query is returning the forbidden error", async () => {
    const forbidden: MeQueryResponse = await request(HOST + "/graphql", `${createMeQuery(NOT_MY_EMAIL as string)}`, {}, {
      "authorization": `Bearer ${newToken}`
    });
    console.log("forbidden request", forbidden);
    expect(forbidden.me.errors).toHaveLength(1);
    expect(forbidden.me.errors[0].message).toBe("403 Forbidden");
  });


  it("checks that we can perform a me query with our new token after registering and also get back a new token", async () => {
    new logger("yellow", "testing mequery to get a refresh token").genLog();
    
    const res: MeQueryResponse = await request(HOST + "/graphql", `${createMeQuery(userEmail)}`, {}, {
      "authorization": `Bearer ${newToken}`
    });

    console.log("errors length property should be undefined: ", res.me.errors?.length);

    //if the length of the actual array is 0 for some reason the length property is set to typeof "undefined"
    expect(res.me.errors?.length).toBe(undefined);
    expect(res.me.token).toBeTruthy();

    //check if old token is expired
    //get new token
    newToken = res.me.token as string;

    console.log("new token", newToken);
    
    expect(newToken).toBeTruthy();
    console.log("me query response test", res);
  });

  it("checks if we delete the user we just made", async () => {
    connection = await connectDb();
    await User.delete({ email: REGISTER_EMAIL });
    const users = await User.find({ where: { email: REGISTER_EMAIL } });
    new logger("green", "deleting a user").genLog();
    logJson(users);
    expect(users).toHaveLength(0);
    connection.close();
  }); 
});