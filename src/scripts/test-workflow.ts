import { CEOAgent } from '../agents/ceo/ceo.agent';
import { getDatabase } from '../database/db';

async function testFullWorkflow() {
  console.log('---------------------------------------------------');
  console.log('Testing CEO Multi-Agent Workflow Pipeline Execution');
  console.log('---------------------------------------------------');

  getDatabase();

  const ceo = new CEOAgent();
  const result = await ceo.execute();

  console.log('\n================ WORKFLOW SUMMARY ================');
  console.log(`Success: ${result.success}`);
  console.log(`Post ID: ${result.postId}`);
  console.log(`FB Post ID: ${result.fbPostId}`);
  console.log(`Daily Topic: ${result.planner.dailyTopic}`);
  console.log(`Isan Quote: ${result.quote.quoteIsan}`);
  console.log(`Thai Meaning: ${result.quote.thaiMeaning}`);
  console.log(`Opening Hook: ${result.copywriter.openingHook}`);
  console.log(`Image Prompt: ${result.imagePrompt.prompt}`);
  console.log(`Reach & Engagement: Reach=${result.analytics?.reach}, EngagementRate=${result.analytics?.engagementRate}%`);
  console.log('==================================================\n');
}

testFullWorkflow().catch(console.error);
