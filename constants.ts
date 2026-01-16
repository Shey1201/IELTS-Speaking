import { IeLtsPart, Topic } from './types';

export const INITIAL_TOPICS: Topic[] = [
  // --- Part 1 ---
  
  // Category: Work & Studies
  {
    id: 'p1-work-1',
    part: IeLtsPart.Part1,
    category: 'Work & Studies',
    title: 'Do you work or are you a student?',
    description: 'Explain your current status.'
  },
  {
    id: 'p1-work-2',
    part: IeLtsPart.Part1,
    category: 'Work & Studies',
    title: 'What do you like most about your job or studies?',
    description: 'Focus on the positive aspects.'
  },
  {
    id: 'p1-work-3',
    part: IeLtsPart.Part1,
    category: 'Work & Studies',
    title: 'Is there anything you dislike about it?',
    description: 'Mention challenges or difficulties.'
  },

  // Category: Hometown
  {
    id: 'p1-home-1',
    part: IeLtsPart.Part1,
    category: 'Hometown',
    title: 'Where is your hometown?',
    description: 'Describe the location briefly.'
  },
  {
    id: 'p1-home-2',
    part: IeLtsPart.Part1,
    category: 'Hometown',
    title: 'Is it a good place to live?',
    description: 'Give reasons why or why not.'
  },
  {
    id: 'p1-home-3',
    part: IeLtsPart.Part1,
    category: 'Hometown',
    title: 'What changes have you seen there recently?',
    description: 'Talk about development or social changes.'
  },

  // Category: Leisure Time
  {
    id: 'p1-leisure-1',
    part: IeLtsPart.Part1,
    category: 'Leisure Time',
    title: 'What do you do in your free time?',
    description: 'List your hobbies.'
  },
  {
    id: 'p1-leisure-2',
    part: IeLtsPart.Part1,
    category: 'Leisure Time',
    title: 'Do you prefer spending time alone or with friends?',
    description: 'Compare the two options.'
  },

  // --- Part 2 ---
  {
    id: 'p2-1',
    part: IeLtsPart.Part2,
    title: 'Describe a traditional festival',
    description: 'You should say: \n- What it is \n- When it is celebrated \n- How people celebrate it \n- And explain why it is important to you.'
  },
  {
    id: 'p2-2',
    part: IeLtsPart.Part2,
    title: 'Describe a person you admire',
    description: 'You should say: \n- Who this person is \n- How you know them \n- What they have done \n- And explain why you admire them.'
  },

  // --- Part 3 ---
  {
    id: 'p3-1',
    part: IeLtsPart.Part3,
    title: 'Festivals and Culture',
    description: 'Why do you think festivals are important for a society? / Do you think traditional festivals are disappearing?',
    relatedTopicId: 'p2-1'
  },
  {
    id: 'p3-2',
    part: IeLtsPart.Part3,
    title: 'Role Models',
    description: 'What kinds of people are usually regarded as role models in your country? / Do celebrities have a responsibility to be good role models?',
    relatedTopicId: 'p2-2'
  }
];