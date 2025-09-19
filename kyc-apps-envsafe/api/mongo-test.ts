import type { VercelRequest, VercelResponse } from "@vercel/node";
import clientPromise from "../kyc-apps-envsafe/services/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("kycdb");   // change name if needed
    const collection = db.collection("logs");

    if (req.method === "POST") {
      const data = req.body;
      await collection.insertOne(data);
      res.status(200).json({ message: "Inserted successfully" });
    } else {
      const docs = await collection.find({}).toArray();
      res.status(200).json(docs);
    }
  } catch (e) {
    res.status(500).json({ error: "MongoDB connection failed", details: e });
  }
}
