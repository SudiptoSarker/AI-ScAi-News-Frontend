import type { NextApiRequest, NextApiResponse } from "next";
import { BlobServiceClient } from "@azure/storage-blob";

type ResponseData = {
    message?: any;
    error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const {query} = req;
    const { blobName } = query;

    const containerName = process.env.NEXT_PUBLIC_CONTAINER_NAME;
    if (!containerName || !blobName) {
        return res.status(400).json({ error: "Invalid parameters" });
    }

    const connectionString = process.env.NEXT_PUBLIC_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
        throw new Error("STORAGE_CONNECTION_STRING is not defined");
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName as string);
    const blobClient = containerClient.getBlobClient(blobName as string);
    
    if (!(await blobClient.exists())) {
        return res.status(404).json({ error: "Blob not found" });
    }

    const blobContent = await blobClient.downloadToBuffer();
    res.status(200).json({ message: blobContent.toString() });

}