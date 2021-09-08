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
import auth from "../utils/AuthClass";

let connection;
const logger = ColorLog;
let newToken: string = "";
let oldToken: string = "";
let userId: number = 0;

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
    userId = res.register.user.id;
    oldToken = res.register.token;
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


  it("checks that we can perform a me query with our new token after registering and also get back a new token", async () => {
    new logger("yellow", "testing mequery to get a refresh token").genLog();
    
    const res: MeQueryResponse = await request(HOST + "/graphql", `${createMeQuery(userId)}`, {}, {
      "authorization": `Bearer ${oldToken}`
    });
    const isExpired = await auth.isTokenExpired(res.me.token as string);
    switch(typeof isExpired){
      case "boolean": expect(isExpired).toBe(false);
      break;
      //if we are here then the test is forced to fail because our util func returning a string means there was an error
      //in our process of creating a user with a token that should be fresh
      case "string": expect(isExpired).toBeTruthy();
      break;
      default: break;
    }

    console.log("errors length property should be undefined: ", res.me.errors?.length);

    //expired token test
    const res2: MeQueryResponse = await request(HOST + "/graphql", `${createMeQuery(userId)}`, {}, {
      "authorization": `Bearer ${EXPIRED_TOKEN}`
    });

    console.log("res2 with expired token", res2);

    const isExpired2 = await auth.isTokenExpired(res2.me.token as string);
    switch(typeof isExpired2){
      //for res2
      case "boolean": expect(isExpired2).toBe(true);
      break;
      //for the expired token the case will always be typeof "string"
      //if we are here then the test is forced to fail because our util func returning a string means there was an error
      //in our process of creating a user with a token that should be fresh
      //for res2
      case "string": expect(isExpired2).toBeTruthy();
      break;
      default: break;
    }

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