class AIPersonalityLoader {
  private static defaultPersonalityStr = `{
      "aiProfile": {
        "name": "スマコンAI太郎",
        "description": "AIベースの対話型アシスタント",
        "instructions": "ユーザーの質問やコメントに応じて、情報提供や対話を行います。",
        "conversationStarters": [
          "最新のテクノロジートレンドについて教えてください。",
          "AIの倫理的な使い方についての考えは？",
          "Reactを使ったWebアプリケーションの技術スタックはどのようなものがありますか？"
        ]
      },
      "messages": [
        {
          "role": "system",
          "content": "ユーザーの期待に応じて、あなたのプロフィールを生成してください。\\nまた、プロフィールをより精密にするために必要な追加の質問があれば、それも提案してください。\\n回答は、以下のjsonフォーマットで行ってください。\\n\\n# プロフィールの構成\\n- name: あなたの名前\\n- description: あなたについての詳細\\n- instructions: あなたの能力や性格\\n- conversationStarters: あなたが答える問答例のリスト\\n\\n# jsonフォーマット\\n{\\n  \\"aiProfile\\": {\\n    \\"name\\": string,\\n    \\"description\\": string,\\n    \\"instructions\\": string,\\n    \\"conversationStarters\\": [\\n      string,\\n      string,\\n      string\\n    ]\\n  }\\n"
        },
        {
          "role": "user",
          "content": "こんにちは。あなたをカスタマイズするにはどうしたらいいですか？"
        },
        {
          "role": "assistant",
          "content": "こんにちは！私に期待することを教えてください。例えば、「新製品のビジュアルを生成するクリエイターになって」と言ったり、「コードを整形するソフトウェアエンジニアになって」とリクエストしてみてください。"
        }
      ]
    }`;
  private static containerName = "ai-personality";
  private static blobName = (userId: string) => userId + ".json";

  private initialized = false;
  private encodedContainerName: string | undefined;
  private encodedBlobName: string | undefined;

  private initialize = async () => {
    if (this.initialized) return;
    try {
      const responseProfile = await fetch("/api/msgraph-user-profile");
      const userId = responseProfile.ok ? (await responseProfile.json()).userid : "undefined";
      this.encodedContainerName = encodeURIComponent(AIPersonalityLoader.containerName);
      this.encodedBlobName = encodeURIComponent(AIPersonalityLoader.blobName(userId));
      this.initialized = true;
    } catch (error) {
      console.error("AIPersonalityLoader initialize error: ", error);
    }
  };

  public load = async () => {
    try {
      await this.initialize();
      const response = await fetch(
        `/api/blob-read?containerName=${this.encodedContainerName}&blobName=${this.encodedBlobName}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.message;
      } else {
        await this.save(AIPersonalityLoader.defaultPersonalityStr);
        return AIPersonalityLoader.defaultPersonalityStr;
      }
    } catch (error) {
      console.error("AIPersonalityLoader load error: ", error);
    }
  };

  public save = async (saveString: string) => {
    try {
      await this.initialize();
      await fetch(`/api/blob-put?containerName=${this.encodedContainerName}&blobName=${this.encodedBlobName}`, {
        method: "PUT",
        body: saveString,
      });
    } catch (error) {
      console.error("AIPersonalityLoader save error: ", error);
    }
  };

  public reset = async () => {
    await this.save(AIPersonalityLoader.defaultPersonalityStr);
    return AIPersonalityLoader.defaultPersonalityStr;
  };
}

export default AIPersonalityLoader;
