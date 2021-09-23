import { NextFunction, Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import jwt from 'jsonwebtoken';
// & sign in typescript joins types together (intersection)
// | sign in typescript gives the option for the type to be either one type or another (union)

//performing an interesection so we can make req.session.userId 
//req.session.welcomeBackMsg and req.session.username available to be assigned
// new values on the req.session object
export type MyContext = {
    req: Request & {
        user: JwtData | null;
        session: Session & Partial<SessionData> & {
            userId?: number;
        } & {
            welcomeBackMsg?: String;
        } & {
            username?: String;
        }
    };
    res: Response;
    next: NextFunction;
}
/**
 * ansi escape code enum collection for printing any color text into the console as the first/third argument of a console.log()
 * @example
 * console.log(`${red || "\x1b[31m"}`, "red text in the log", `${reset || "\x1b[00m"}`)
 */
 export enum ANSI_ESCAPES {
    danger = "\x1b[31m",
    success = "\x1b[32m",
    info = "\x1b[36m",
    warning = "\x1b[33m",
    link = "\x1b[35m",
    danger_back = "\x1b[41m",
    success_back = "\x1b[42m",
    warning_back = "\x1b[43m",
    info_back = "\x1b[44m",
    link_back = "\x1b[45m",
    reset = "\x1b[00m",
  }
export interface RegisterResponse {
    register: {
        errors: MyErrorResponse
        token: string
        user: UserEntityBase
    }
}
export interface RegisterErrorResponse {
    register: {
        errors: MyErrorResponse
        user: null;
    }
}
export interface LoginResponse {
    login: {
        errors: MyErrorResponse
        user: UserEntityBase
    }
}
export interface LogoutResponse {
    logout: {
        errors: MyErrorResponse
        done: boolean | null
    };
}

export type JwtData = IJwtData;

export interface IJwtData extends jwt.JwtPayload {
    username: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface CustomError {
    field: string;
    message: string;
}
export type MyErrorResponse = CustomError[];

export interface AddTodoResponse {
    addTodo: {
        todos: null | Todo[]
        errors: MyErrorResponse
    }
}

export interface GetUserTodosResponse {
    getUserTodos: {
        todos?: Todo[];
        errors: MyErrorResponse
    }
}

export interface Todo {
    text: string;
    id: number;
    createdAt: string;
    updatedAt: string;
    creatorId: number;

}

export interface ClearUserTodosResponse {
    clearUserTodos: {
        done: boolean | null;
        errors: MyErrorResponse
    }
}

export interface EditTodoByIdResponse {
    editTodoById: {
        errors: MyErrorResponse
        todo?: null | Todo
    }
}

export interface EditTodoPayload {
    text: string | undefined;
    todoId: number | undefined;
}

export interface UserEntityBase {
    id: number;
    username: string;
    email: string;
    token: string | null;
    createdAt: number;
    updatedAt: number;
}

export interface MeQueryResponse {
    me: {
        user: {
          token: string;
          username: string;
          email: string;
        };
        errors: MyErrorResponse;
      };
}
