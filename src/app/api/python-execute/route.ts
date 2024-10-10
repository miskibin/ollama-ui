import { executePythonCode } from "@/tools/python-server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { code } = req.body;
    try {
      const result = await executePythonCode(code);
      res.status(200).json({ result });
    } catch (error) {
      res.status(500).json({ error: "Error executing Python code" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
