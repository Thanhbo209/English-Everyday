import { VocabItem } from "../../infrastructure/prisma/generated/prisma/client";
import {
  CreateVocabItemInput,
  UpdateVocabItemInput,
} from "./vocab-item.schema";
import { prisma } from "../../config/prisma.js";
export type OrderEntry = { id: string; orderIndex: number };

export class VocabItemRepository {
  async findBySetId(setId: string): Promise<VocabItem[]> {
    return prisma.vocabItem.findMany({
      where: { setId },
      orderBy: { orderIndex: "asc" },
    });
  }

  async findById(id: string): Promise<VocabItem | null> {
    return prisma.vocabItem.findFirst({ where: { id } });
  }

  async countBySetId(setId: string): Promise<number> {
    return prisma.vocabItem.count({ where: { setId } });
  }

  async create(
    setId: string,
    orderIndex: number,
    data: CreateVocabItemInput,
  ): Promise<VocabItem> {
    return prisma.vocabItem.create({
      data: {
        setId,
        orderIndex,
        term: data.term,
        definition: data.definition,
        phonetic: data.phonetic ?? null,
        partOfSpeech: data.partOfSpeech ?? "",
        exampleSentence: data.exampleSentence ?? null,
      },
    });
  }

  async update(id: string, data: UpdateVocabItemInput): Promise<VocabItem> {
    await prisma.vocabItem.updateMany({ where: { id }, data });
    return this.findByIdOrThrow(id);
  }

  async updateImageUrl(id: string, imageUrl: string): Promise<VocabItem> {
    await prisma.vocabItem.updateMany({ where: { id }, data: { imageUrl } });
    return this.findByIdOrThrow(id);
  }

  async updateAudioUrl(id: string, audioUrl: string): Promise<VocabItem> {
    await prisma.vocabItem.updateMany({ where: { id }, data: { audioUrl } });
    return this.findByIdOrThrow(id);
  }

  async delete(id: string): Promise<void> {
    await prisma.vocabItem.deleteMany({ where: { id } });
  }

  async bulkCreate(
    setId: string,
    startIndex: number,
    items: CreateVocabItemInput[],
  ): Promise<VocabItem[]> {
    const created: VocabItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = await prisma.vocabItem.create({
        data: {
          setId,
          orderIndex: startIndex + i,
          term: items[i].term,
          definition: items[i].definition,
          phonetic: items[i].phonetic ?? null,
          partOfSpeech: items[i].partOfSpeech ?? "",
          exampleSentence: items[i].exampleSentence ?? null,
        },
      });
      created.push(item);
    }
    return created;
  }

  async updateOrder(entries: OrderEntry[], tx?: any): Promise<void> {
    if (entries.length === 0) return;

    const client = tx || prisma;

    // 1. Set temporary negative indexes for ALL entries to avoid unique constraint violations
    for (const e of entries) {
      await client.vocabItem.updateMany({
        where: { id: e.id },
        data: { orderIndex: -(e.orderIndex + 1) },
      });
    }

    // 2. Set the final positive indexes for ALL entries
    for (const e of entries) {
      await client.vocabItem.updateMany({
        where: { id: e.id },
        data: { orderIndex: e.orderIndex },
      });
    }
  }

  private async findByIdOrThrow(id: string): Promise<VocabItem> {
    const item = await prisma.vocabItem.findFirst({ where: { id } });
    if (!item) throw new Error(`VocabItem not found after update: ${id}`);
    return item;
  }
}
