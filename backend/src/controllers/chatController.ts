import type { RequestHandler } from "express";

const getAllChats: RequestHandler = (req, res) => {
    res.json({"message": "Get all chats"});
    }

const createChat: RequestHandler = (req, res) => {
    res.json({"message": "Create a new chat"});
    }

const updateChat: RequestHandler = (req, res) => {
    res.json({"message": "Update a chat"});
    }

const deleteChat: RequestHandler = (req, res) => {
    res.json({"message": "Delete a chat"});
    }

export { getAllChats, createChat, updateChat, deleteChat };