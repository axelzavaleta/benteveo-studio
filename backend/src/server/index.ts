import server from "./app.ts";
import "dotenv/config"

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
})