// routes/contact.routes.js
import express from "express";
import { postContact } from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/", postContact);

export default router;
