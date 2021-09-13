class AuthService {
  public async getToken(): Promise<string | null> {
    let decrypted = "";
    return new Promise((resolve) => {
      // Retrieves the user token from localStorage
      const token = localStorage.getItem("id_token");
      //will be encrypted lets decrypt it
      decrypted = Buffer.from(token as string, "base64").toString();
      if (decrypted) resolve(decrypted);
      else return resolve(null);
    });
  }

  public setToken(token: string): void {
    // Saves user token to localStorage
    let encrypted = "";
    //encrypt token before setting to storage
    encrypted = Buffer.from(token).toString("base64");
    localStorage.setItem("id_token", encrypted);
    return;
  }

  public setEmail(email: string): void {
    localStorage.setItem("global_email", email);
  }

  public async clearToken(): Promise<void | Error> {
    const token = await this.getToken();
    if (token) {
      localStorage.removeItem("id_token");
    } else return new Error("could not clear token, was undefined or null");
  }
}

export default new AuthService();
