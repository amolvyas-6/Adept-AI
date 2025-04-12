import { API } from "../config/apiClient";


export const sendPDF = async (files: FormData) => API.post("/api/parsePDF", files)

export const sendLink = async () => API.post("/api/parseLink")

export const removeToken = async () => API.post("/api/deleteToken")

export const getSession = async () => API.get("/api/getToken")

export const sendImg = async (file: FormData) => API.post("/api/parseImg", file)