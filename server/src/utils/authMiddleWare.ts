import { ANSI_ESCAPES, JwtData, MyContext } from "../types";
import jwt from "jsonwebtoken";
require('dotenv').config();

const {
  SECRET,
  EXPIRATION
} = process.env

export function authMiddleware(
  context: MyContext
): MyContext {
  async function verifyAsync(token: string): Promise<jwt.JwtPayload> {
    let returnedDecoded: any;
    jwt.verify(
      token as string,
      SECRET as string,
      { maxAge: EXPIRATION }, //maxage deprecated but still accepted...
      (error, decoded) => {
        if (error?.message.includes("malformed")) throw new Error(error.message);
        if (error?.message.includes("expired")) throw new Error(error.message)
        if (decoded) returnedDecoded = decoded;
        
      } 
    );
    return returnedDecoded;
  }
  try {
    // allows token to be sent via req.body, req.query, or headers
    let token = context.req.headers.authorization;
    
    // console.log("got token from middleware??", token);
    
    // ["Bearer", "<tokenvalue>"] 
    //received by apollo server and the login mutation
    if (context.req.headers.authorization) {
      //token = Bearer `${token}`<- getting this token part from the context request headers
      // and remove any white space before or after the token string if any
      token = token?.split(' ')?.pop()?.trim() as string;
    }
    
    // console.log(ANSI_ESCAPES.yellow, `token recieved ${token}`, ANSI_ESCAPES.reset);
    if (!token) {
      context.req.user = null;
      return context;
    }

    verifyAsync(token).then((decoded) => {
      context.req.user = <JwtData>decoded;
    }).catch((err: Error) => {
      //cant use logger here because i need the whole stack in the error logs
      console.error(
        `${ANSI_ESCAPES.red}`, 
        `ERROR in verifying the token async function ${err.stack}`, 
        `${ANSI_ESCAPES.reset}`
      );
    });
    
    return context;
  } catch (error) {
    console.log("got an error", error);
    return context;
  }

}