import { parse } from "csv-parse/sync";
import { AppError, ErrorCode } from "../../shared/errors/app.error";

export interface ParsedCsvRow {
  term: string;
  definition: string;
  phonetic?: string;
}

export interface CsvPreviewRow {
  row: number;
  term?: string;
  definition?: string;
  phonetic?: string;
  valid: boolean;
  error?: string;
}

export interface CsvPreviewResult {
  valid: ParsedCsvRow[];
  preview: CsvPreviewRow[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
}

export class CsvService {
  parseCsv(buffer: Buffer): CsvPreviewResult {
    let records: Record<string, string>[];

    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];
    } catch {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, "Invalid CSV format");
    }

    if (records.length === 0) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, "CSV file is empty");
    }

    const firstRow = records[0];
    if (!("term" in firstRow) || !("definition" in firstRow)) {
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'CSV must contain "term" and "definition" columns',
      );
    }

    const preview: CsvPreviewRow[] = [];
    const valid: ParsedCsvRow[] = [];

    records.forEach((record, index) => {
      const rowNumber = index + 2; // +2 accounts for 1-based index and header row
      const term = record["term"]?.trim();
      const definition = record["definition"]?.trim();
      const phonetic = record["phonetic"]?.trim() || undefined;

      if (!term) {
        preview.push({ row: rowNumber, valid: false, error: "Missing term" });
        return;
      }

      if (!definition) {
        preview.push({
          row: rowNumber,
          term,
          valid: false,
          error: "Missing definition",
        });
        return;
      }

      const row: ParsedCsvRow = {
        term,
        definition,
        ...(phonetic ? { phonetic } : {}),
      };
      valid.push(row);
      preview.push({ row: rowNumber, term, definition, phonetic, valid: true });
    });

    return {
      valid,
      preview,
      totalRows: records.length,
      validCount: valid.length,
      invalidCount: records.length - valid.length,
    };
  }
}
