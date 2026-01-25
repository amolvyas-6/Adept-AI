import type { RequestHandler } from "express";

const getAllDocuments: RequestHandler = (req, res) => {
  return res.json({ message: "Get all documents" });
};

const createDocument: RequestHandler = (req, res) => {
  return res.json({ message: "Create a new document" });
};

const deleteDocument: RequestHandler = (req, res) => {
  return res.json({ message: "Delete a document" });
};

export { getAllDocuments, createDocument, deleteDocument };
