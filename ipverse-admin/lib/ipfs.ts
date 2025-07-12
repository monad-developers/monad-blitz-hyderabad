/** @format */

import { PinataSDK } from "pinata";

interface FileMetadata {
  name?: string;
  keyvalues?: Record<string, string>;
}

const GATEWAY_URL="indigo-imperial-crawdad-414.mypinata.cloud"
const NEXT_PUBLIC_PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZTdmN2ZjMS04NTU4LTQwNzctODJhNC00YzIyYWM1ODc1ZTciLCJlbWFpbCI6ImV2ZXJ5dGhpbmdnYXVyYXY0OEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTQzYzlhYzQ1MzRhMjVkZTAzZTEiLCJzY29wZWRLZXlTZWNyZXQiOiJhZDRkNDVjNGI5ZTZlMzI0NWNlZTdhOTM5OTQ1MjI2MWU4NDE4MDU4NzhjM2Q1MTJmYjBlNTdjNTUxZGFlY2RlIiwiZXhwIjoxNzczNzY5NjAyfQ.cTOlilx6z_5DiB-ykFGmvQGfdwTpWCzQPT9EhnSh--k"

export class PinataFileManager {
  private pinata: PinataSDK;

  constructor() {
    if (!NEXT_PUBLIC_PINATA_JWT) {
      throw new Error('NEXT_PUBLIC_PINATA_JWT environment variable is required');
    }
    if (!GATEWAY_URL) {
      throw new Error('GATEWAY_URL environment variable is required');
    }

    this.pinata = new PinataSDK({
      pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
      pinataGateway: process.env.GATEWAY_URL,
    });
    // Gateway URL is set in PinataSDK constructor
  }

  async uploadFile(
    file: File,
    network: 'public' ,
    metadata?: FileMetadata
  ): Promise<string> {
    try {
      console.log(file,metadata);
      let uploadChain = network === 'public'
        ? this.pinata.upload.public.file(file):console.log("network not connected to public ");

      if (metadata?.name && uploadChain) uploadChain = uploadChain.name(metadata.name);
      if (metadata?.keyvalues && uploadChain) uploadChain = uploadChain.keyvalues(metadata.keyvalues);

      const result = await uploadChain;
      return result?.cid || '';
    } catch (error) {
      console.error(`Error uploading file to ${network} IPFS:`, error);
      throw new Error(`Failed to upload file to ${network} IPFS`);
    }
  }

  async uploadFiles(
    files: File[],
    network: 'public' | 'private',
    metadata?: FileMetadata
  ): Promise<string[]> {
    try {
      if (!files.length) {
        throw new Error('Company metadata upload requires at least one document file');
      }

      const uploadChain = Promise.all(files.map(file => {
        let fileChain = network === 'public'
          ? this.pinata.upload.public.file(file)
          : this.pinata.upload.private.file(file);

        fileChain = metadata?.name ? fileChain.name(metadata.name) : fileChain;
        fileChain = metadata?.keyvalues ? fileChain.keyvalues(metadata.keyvalues) : fileChain;

        return fileChain.then(result => result.cid);
      }));

      return uploadChain;
    } catch (error) {
      console.error(`IPFS upload failure: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        network,
        fileCount: files.length,
        fileTypes: files.map(f => f.type)
      });
      throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : 'Check console for details'}`);
    }
  }

  async uploadJSON(
    data: any,
    network: 'public' | 'private',
    metadata?: FileMetadata
  ): Promise<string> {
    try {
      let uploadChain = network === 'public'
        ? this.pinata.upload.public.json(data)
        : this.pinata.upload.private.json(data);

      if (metadata?.name) uploadChain = uploadChain.name(metadata.name);
      if (metadata?.keyvalues) uploadChain = uploadChain.keyvalues(metadata.keyvalues);

      const result = await uploadChain;
      return result.cid;
    } catch (error) {
      console.error(`Error uploading JSON to ${network} IPFS:`, error);
      throw new Error(`Failed to upload JSON to ${network} IPFS`);
    }
  }

  async listFiles(
    network: 'public' | 'private'
  ): Promise<any[]> {
    try {
      const result = network === 'public'
        ? await this.pinata.files.public.list()
        : await this.pinata.files.private.list();
      return result.files; // Use 'files' based on SDK response structure
    } catch (error) {
      console.error(`Error listing ${network} files:`, error);
      throw new Error(`Failed to list ${network} files`);
    }
  }

  async updateFileMetadata(
    network: 'public' | 'private',
    fileId: string,
    metadata: FileMetadata
  ): Promise<void> {
    try {
      const updateData = {
        id: fileId,
        name: metadata.name,
        keyvalues: metadata.keyvalues,
      };
      if (network === 'public') {
        await this.pinata.files.public.update(updateData);
      } else {
        await this.pinata.files.private.update(updateData);
      }
    } catch (error) {
      console.error(`Error updating ${network} file metadata:`, error);
      throw new Error(`Failed to update ${network} file metadata`);
    }
  }

  async deleteFile(network: 'public' | 'private', fileId: string): Promise<void> {
    try {
      if (network === 'public') {
        await this.pinata.files.public.delete([fileId]);
      } else {
        await this.pinata.files.private.delete([fileId]);
      }
    } catch (error) {
      console.error(`Error deleting ${network} file:`, error);
      throw new Error(`Failed to delete ${network} file`);
    }
  }

  async getFileURL(cid: string, network: 'public' | 'private'): Promise<string> {
    try {
      // For now, just return the gateway URL with the CID
      const gatewayUrl = process.env.GATEWAY_URL;
      return `${gatewayUrl}/ipfs/${cid}`;

    } catch (error) {
      console.error(`Error generating ${network} file URL:`, error);
      throw new Error(`Failed to generate ${network} file URL`);
    }
  }
}