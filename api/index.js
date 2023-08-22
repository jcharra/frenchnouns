import express from "express";
import { NOUNS } from "../nouns_lefff.js";

const app = express();
const port = 3000;

app.get("/api/noun", (req, res) => {
  const randomIndex = Math.floor(Math.random() * NOUNS.length);

  const responseData = {
    noun: NOUNS[randomIndex],
  };

  res.json(responseData);
});

if (process.env.ENV === "dev") {
  app.use(express.static("public"));
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
