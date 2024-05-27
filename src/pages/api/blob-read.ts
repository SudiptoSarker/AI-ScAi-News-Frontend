import type { NextApiRequest, NextApiResponse } from "next";
import { BlobServiceClient } from "@azure/storage-blob";

type ResponseData = {
  message?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { query } = req;
  const { containerName, blobName, encode } = query;

  if (!containerName || !blobName) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const connectionString = process.env.STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("STORAGE_CONNECTION_STRING is not defined");
  }
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName as string);
  await containerClient.createIfNotExists();

  const blobClient = containerClient.getBlobClient(blobName as string);
  if (!(await blobClient.exists())) {
    return res.status(404).json({ error: "Blob not found" });
  }

  const blobContent = await blobClient.downloadToBuffer();
  if (encode === "base64") {
    const base64PdfData = blobContent.toString("base64");
    res.status(200).json({ message: base64PdfData });
  } else {
    res.status(200).json({ message: blobContent.toString() });
  }
}
