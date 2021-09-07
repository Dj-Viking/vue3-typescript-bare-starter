import { JwtData, MyContext } from "../types";
import jwt from "jsonwebtoken";
require('dotenv').config();

const {
  SECRET,
  EXPIRATION
} = process.env


export function authMiddleware(
  context: MyContext
): MyContext {
  async function verifyAsync(token: string) {
    return jwt.verify(token as string,
      SECRET as string,
      { maxAge: EXPIRATION } //maxage deprecated but still accepted...
    );
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
      token = token?.split(' ')?.pop()?.trim();
    }
    
    // console.log(ANSI_ESCAPES.yellow, `token recieved ${token}`, ANSI_ESCAPES.reset);
    if (!token) {
      context.req.user = null;
      return context;
    }

    verifyAsync(token).then((decoded) => {
      console.log("decoded", decoded);
      
      context.req.user = <JwtData>decoded;
    }).catch(err => console.error(err))
    
    return context;
  } catch (error) {
    //console.log(error);
    return context;
  }

}