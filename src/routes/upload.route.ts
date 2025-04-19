import { Router } from "express";
import multer from "multer";
import express from "express";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Save "uploads/" folder

router.get("/file",(req,res)=>{
    res.json({
        name:"Amos",
        message:"test",
    })
})
export default router;