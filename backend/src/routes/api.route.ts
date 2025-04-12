import { Router } from "express";
import { connectionHandler, delTokenHandler, getTokenHandler, imgHandler, linkHandler, pdfHandler } from "../controllers/api.controller";
import multer from "multer";


const upload = multer()
const apiRoutes = Router();

// prefix: /api
apiRoutes.post("/parsePDF", upload.any(), pdfHandler);
apiRoutes.post("/checkConnection", connectionHandler);
apiRoutes.post("/parseLink", linkHandler);
apiRoutes.post("/deleteToken", delTokenHandler);
apiRoutes.get("/getToken", getTokenHandler)
apiRoutes.post("/parseImg", upload.any(), imgHandler)

export default apiRoutes;
