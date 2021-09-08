import decode, { JwtPayload } from 'jwt-decode';

class AuthService {

  public async isTokenExpired(token: string): Promise<boolean | string> {
    console.log("token we're trying to check", token);
    
    try {
      const decoded: JwtPayload = decode(token);
      if (<JwtPayload>decoded.exp < Date.now() / 1000) 
        return true;
      else 
        return false;
    } catch (err) {
      console.error("error when verifying expiration", err.message as Error["message"]);
      return err.message
    }
  }

}

export default new AuthService();