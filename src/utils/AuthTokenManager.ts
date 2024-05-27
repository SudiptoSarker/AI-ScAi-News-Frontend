import { NextApiRequest } from "next";
import { generateHashName } from "./Crypto";
import jwt from "jsonwebtoken";

class AuthTokenManager {
  private idToken: string | undefined;
  private accessToken: string | undefined;
  private refreshToken: string | undefined;
  private userId: string | undefined;

  constructor(req: NextApiRequest) {
    this.idToken = req.headers["x-ms-token-aad-id-token"] as string | undefined;
    this.accessToken = req.headers["x-ms-token-aad-access-token"] as string | undefined;
    this.refreshToken = req.headers["x-ms-token-aad-refresh-token"] as string | undefined;
    this.userId = this.generateUserId(this.idToken);
  }

  private generateUserId(idToken: string | undefined): string | undefined {
    if (idToken) {
      const decodedIdToken = jwt.decode(idToken) as jwt.JwtPayload | null;
      if (decodedIdToken && decodedIdToken.sub) {
        return generateHashName(decodedIdToken.sub);
      }
    }
    return undefined;
  }

  public getIdToken(): string | undefined {
    return this.idToken;
  }

  public getAccessToken(): string | undefined {
    return this.accessToken;
  }

  public getRefreshToken(): string | undefined {
    return this.refreshToken;
  }

  public getUserId(): string | undefined {
    return this.userId;
    //return '1234561';
  }

  public extractEmailFromIdToken(): { mail: string | null } {
    if (this.idToken) {
      const decodedIdToken = jwt.decode(this.idToken) as jwt.JwtPayload | null;

      if (decodedIdToken && decodedIdToken.email) {
        return { mail: decodedIdToken.email };
      }
    }
    return { mail: "undefined" };
  }

  public printAccessTokenDetails() {
    if (this.accessToken) {
      const decodedToken = jwt.decode(this.accessToken) as jwt.JwtPayload | null;

      if (decodedToken) {
        const scopes = decodedToken["scp"] as string | undefined;
        console.log("Scopes in Access Token:", scopes);

        const issuedAt = decodedToken["iat"] ? new Date(decodedToken["iat"] * 1000) : "Unknown";
        const expires = decodedToken["exp"] ? new Date(decodedToken["exp"] * 1000) : "Unknown";
        console.log("Token Issued At:", issuedAt);
        console.log("Token Expires:", expires);
      } else {
        console.log("Unable to decode access token");
      }
    } else {
      console.log("No access token available");
    }
  }
}

export default AuthTokenManager;
