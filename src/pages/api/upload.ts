import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const PINATA_API_KEY = process.env.NEXT_PINATA_API_KEY!;
const PINATA_SECRET_API_KEY = process.env.NEXT_PINATA_SECRET_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to parse form" });
    }

    const file = files.file as formidable.File;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.filepath));

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
        }
      );

      res.status(200).json({ ipfsHash: response.data.IpfsHash });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to upload to Pinata" });
    }
  });
}
