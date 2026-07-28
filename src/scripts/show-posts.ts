import { PostsRepository } from '../database/repositories/posts.repo';

const posts = PostsRepository.getFullPosts(3);
console.log('--- RECENT POSTS ---');
console.log(JSON.stringify(posts, null, 2));
