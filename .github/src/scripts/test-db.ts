import { getDatabase } from '../database/db';
import { QuotesRepository } from '../database/repositories/quotes.repo';

async function testDatabase() {
  console.log('Testing SQLite Database and Repositories...');
  const db = getDatabase();

  const sampleQuote = "ฮักแพงกันไว้ มื้อนี้อาจสิเหนื่อยแต่มื้อหน้าเฮาสิสบายไปด้วยกัน";
  const duplicate = QuotesRepository.isDuplicate(sampleQuote);
  console.log(`Is duplicate test quote: ${duplicate}`);

  if (!duplicate) {
    const id = QuotesRepository.insert({
      quote_isan: sampleQuote,
      thai_meaning: "รักและผูกพันกันไว้ วันนี้อาจจะเหนื่อย แต่วันข้างหน้าเราจะสบายไปด้วยกัน",
      emotion: "Romantic & Encouraging",
      keywords: "ฮักแพง, เหนื่อย, สบาย",
      hash_code: QuotesRepository.generateHash(sampleQuote),
    });
    console.log(`Successfully inserted test quote with ID: ${id}`);
  }

  const quotes = QuotesRepository.getRecent(5);
  console.log(`Recent quotes count: ${quotes.length}`);
  console.log('Database test complete!');
}

testDatabase().catch(console.error);
