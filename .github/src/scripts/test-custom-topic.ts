import { CEOAgent } from '../agents/ceo/ceo.agent';
import { getDatabase } from '../database/db';

async function testCustomTopic() {
  console.log('Testing CEO Workflow with Custom Topic Override...');
  getDatabase();

  const ceo = new CEOAgent();
  const result = await ceo.execute({
    customTopic: 'ความรักคนไกลบ้าน คิดฮอดเพิ่นหลาย',
  });

  console.log('\n================ CUSTOM TOPIC TEST SUMMARY ================');
  console.log(`Success: ${result.success}`);
  console.log(`Post ID: ${result.postId}`);
  console.log(`FB Post ID: ${result.fbPostId}`);
  console.log(`Custom Daily Topic: ${result.planner.dailyTopic}`);
  console.log(`Generated Isan Quote: ${result.quote.quoteIsan}`);
  console.log(`Thai Meaning: ${result.quote.thaiMeaning}`);
  console.log('===========================================================\n');
}

testCustomTopic().catch(console.error);
