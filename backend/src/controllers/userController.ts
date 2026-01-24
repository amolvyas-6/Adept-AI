import type { RequestHandler } from "express";

const getAllUsers: RequestHandler = (req, res) => {
    res.json({"message": "Get all users"});
    }

const createUser: RequestHandler = (req, res) => {
    res.json({"message": "Create a new user"});
    }

const updateUser: RequestHandler = (req, res) => {
    res.json({"message": "Update a user"});
    }

const deleteUser: RequestHandler = (req, res) => {
    res.json({"message": "Delete a user"});
    }

export { getAllUsers, createUser, updateUser, deleteUser };
