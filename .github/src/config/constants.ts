export interface DayStrategy {
  dayName: string;
  topic: string;
  theme: string;
  emotion: string;
  targetAudience: string;
}

export const DAY_STRATEGIES: Record<number, DayStrategy> = {
  0: { // Sunday
    dayName: 'Sunday',
    topic: 'Wisdom & Life Lessons (ปัญญาและคติธรรมคำสอน)',
    theme: 'Isan Wisdom & Mindfulness',
    emotion: 'Peaceful, Reflective, Wise',
    targetAudience: 'Working adults, elders, general public',
  },
  1: { // Monday
    dayName: 'Monday',
    topic: 'Motivation & Fighting Spirit (กำลังใจ สู้ชีวิต)',
    theme: 'Monday Work Motivation & Perseverance',
    emotion: 'Inspiring, Encouraging, Strong',
    targetAudience: 'Laborers, workers, students, entrepreneurs',
  },
  2: { // Tuesday
    dayName: 'Tuesday',
    topic: 'Love & Longing (ความรัก ความคิดถึง)',
    theme: 'Isan Romance & Faraway Heartbeat',
    emotion: 'Sweet, Melancholy, Romantic',
    targetAudience: 'Lovers, people working away from hometown',
  },
  3: { // Wednesday
    dayName: 'Wednesday',
    topic: 'Life Reality & Gratitude (สัจธรรมชีวิตและความกตัญญู)',
    theme: 'Realities of Life & Hometown Memories',
    emotion: 'Nostalgic, Heartwarming, Deep',
    targetAudience: 'Isan diaspora, family lovers',
  },
  4: { // Thursday
    dayName: 'Thursday',
    topic: 'Family & Roots (ครอบครัวและอบอุ่น)',
    theme: 'Warmth of Isan Home & Parents',
    emotion: 'Warm, Loving, Respectful',
    targetAudience: 'Parents, children, tight-knit family members',
  },
  5: { // Friday
    dayName: 'Friday',
    topic: 'Funny & Lighthearted (ตลก เฮฮา หยอกล้อ)',
    theme: 'Weekend Humorous Isan Banter',
    emotion: 'Joyful, Humorous, Cheerful',
    targetAudience: 'Youth, social media users, friends',
  },
  6: { // Saturday
    dayName: 'Saturday',
    topic: 'Village Lifestyle & Culture (วิถีชีวิตบ้านนา ประเพณี)',
    theme: 'Isan Village Roots, Food & Culture',
    emotion: 'Proud, Authentic, Earthy',
    targetAudience: 'Isan culture enthusiasts, local community',
  },
};

export const COMMON_ISAN_HASHTAGS = [
  '#เว้าไปสั่นล่ะ',
  '#คำคมอีสาน',
  '#อีสานบ้านเฮา',
  '#ข้อคิดชีวิต',
  '#แคปชั่นอีสาน',
  '#กำลังใจ',
  '#คิดฮอดบ้าน',
  '#วิถีชีวิตอีสาน',
];
