import type { NextApiRequest, NextApiResponse } from "next";
import { BlobServiceClient, BlobUploadCommonResponse, BlockBlobParallelUploadOptions } from "@azure/storage-blob";

type ResponseData = {
    message?: any;
    error?: string;
    exists?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const { query, body } = req;
    const { blobName, overwriteCase } = query;

    const containerName = process.env.NEXT_PUBLIC_CONTAINER_NAME;
    if (!containerName || !blobName) {
        return res.status(400).json({ error: "Invalid parameters" });
    }

    const connectionString = process.env.NEXT_PUBLIC_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
        throw new Error("STORAGE_CONNECTION_STRING is not defined");
    }

    let overwriteCondition = overwriteCase === 'true' ? true : false;

    // return res.status(200).json({message: overwriteCondition });
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName as string);
    await containerClient.createIfNotExists();

    const blobClient = containerClient.getBlockBlobClient(blobName as string);
    if((await blobClient.exists()) && !overwriteCondition) {
        return res.status(200).json({exists: "Blob already exists"});
    }

    const contentBytes = Buffer.from(JSON.stringify(body), "utf-8");
    await blobClient.uploadData(contentBytes, {
        blobHTTPHeaders: { blobContentType: "application/json" }
    });
    return res.status(200).json({message: "Store blob successfully"})


}