import type { NextApiRequest, NextApiResponse } from "next";
import { BlobServiceClient, BlobUploadCommonResponse } from "@azure/storage-blob";

type ResponseData = {
  message?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { query, body } = req;
  const { containerName, blobName } = query;

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

  const blobClient = containerClient.getBlockBlobClient(blobName as string);
  const uploadBlobResponse: BlobUploadCommonResponse = await blobClient.upload(body, body.length);
  res.status(200).json({ message: uploadBlobResponse.requestId });
}
