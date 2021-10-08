import jwt from "jsonwebtoken";
import { SignLoginRegisterMeTokenArgs, SignResetPasswordTokenArgs } from "../types";
require("dotenv").config();

const {
  SECRET,
  EXPIRATION
} = process.env;

export function signToken(args: SignLoginRegisterMeTokenArgs | SignResetPasswordTokenArgs): string {
  
  const {
    username, 
    password,
    email
  } = args as SignLoginRegisterMeTokenArgs;


  const {
    resetEmail
,   uuid,
    exp
  } = args as SignResetPasswordTokenArgs;
  
  switch (true) {
    case Boolean(username && password && email): {
      return jwt.sign({
        username,
        password,
        email
      },
      SECRET as string,
      { expiresIn: EXPIRATION as string });
    }
    case Boolean(uuid && exp && resetEmail): {
      return jwt.sign({
        resetEmail,
        uuid
      },
      SECRET as string,
      { expiresIn: exp })
    }
    default: return "can't sign a valid token";
  }
} 