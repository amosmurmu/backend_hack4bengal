import express, { Request, Response, NextFunction } from "express";

import uploadRoutes from "./routes/upload.route";
import {testConnection} from "./config/db";
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});
app.use(express.json()); // Middleware to parse JSON
app.use(express.static("public")); // Serve static files
app.use("/api", uploadRoutes);


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

(async ()=>{
  const result = await testConnection();
  if(!result.success){
    console.error("Supabase test failed, Exiting...");
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`Server running on  `, { PORT });
  });
})();
