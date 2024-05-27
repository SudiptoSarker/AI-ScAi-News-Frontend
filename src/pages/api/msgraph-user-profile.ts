import type { NextApiRequest, NextApiResponse } from "next";
import AuthTokenManager from "@/utils/AuthTokenManager";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authTokenManager = new AuthTokenManager(req);
  authTokenManager.printAccessTokenDetails();

  const response = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${authTokenManager.getAccessToken()}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    const responseData = {
      ...data,
      userid: authTokenManager.getUserId(),
    };
    res.status(200).json(responseData);
    return;
  }

  // Graph APIから情報を取得できない場合、IDトークンからメールアドレスを取得し、useridも含める
  res.status(200).json({
    ...authTokenManager.extractEmailFromIdToken(),
    userid: authTokenManager.getUserId(),
  });
}
