import { PostsRepository } from '../database/repositories/posts.repo';

const posts = PostsRepository.getFullPosts(20);
const isanPosts = posts.filter(p => p.quote_isan && !p.quote_isan.includes('สุนัข'));
console.log('--- ISAN QUOTE POSTS ---');
console.log(JSON.stringify(isanPosts.slice(0, 3), null, 2));
