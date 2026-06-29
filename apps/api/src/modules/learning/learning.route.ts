import { middlewareHandler } from "../../shared/middlewares/preHandlers.js";
import { prisma } from "../../config/prisma.js";

export async function learningRoutes(app: any) {
  const { authPreHandler } = middlewareHandler(app);

  app.get("/w1/:vocabSetId/grid", { preHandler: authPreHandler }, async (request: any, reply: any) => {
    const { vocabSetId } = request.params as { vocabSetId: string };

    // Fetch vocab items
    const vocabItems = await prisma.vocabItem.findMany({
      where: { setId: vocabSetId },
      orderBy: { orderIndex: "asc" },
    });

    if (!vocabItems || vocabItems.length === 0) {
      return reply.status(404).send({ message: "No vocabulary items found for this set." });
    }

    // Grid Generation Logic
    const size = 15;
    const grid: string[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(""));

    const words = vocabItems
      .map((item) => ({
        word: item.term.trim().toUpperCase().replace(/[^A-Z]/g, ""),
        clue: item.definition,
        found: false,
      }))
      .filter((w) => w.word.length >= 2 && w.word.length <= size);

    const directions = [
      [0, 1], // Horizontal right
      [0, -1], // Horizontal left
      [1, 0], // Vertical down
      [-1, 0], // Vertical up
      [1, 1], // Diagonal down-right
      [-1, -1], // Diagonal up-left
      [1, -1], // Diagonal down-left
      [-1, 1], // Diagonal up-right
    ];

    for (const w of words) {
      let placed = false;
      let retries = 0;

      while (!placed && retries < 150) {
        retries++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        // Check fit
        const len = w.word.length;
        const endRow = row + dir[0] * (len - 1);
        const endCol = col + dir[1] * (len - 1);

        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
          continue;
        }

        let conflict = false;
        for (let i = 0; i < len; i++) {
          const r = row + dir[0] * i;
          const c = col + dir[1] * i;
          if (grid[r][c] !== "" && grid[r][c] !== w.word[i]) {
            conflict = true;
            break;
          }
        }

        if (!conflict) {
          for (let i = 0; i < len; i++) {
            const r = row + dir[0] * i;
            const c = col + dir[1] * i;
            grid[r][c] = w.word[i];
          }
          placed = true;
        }
      }
    }

    // Fill grid with random letters
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === "") {
          grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    return reply.status(200).send({
      grid,
      words: words.map((w) => ({ word: w.word, clue: w.clue, found: false })),
    });
  });
}
