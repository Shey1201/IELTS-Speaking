
import { IeLtsPart, Topic } from './types';

export const INITIAL_TOPICS: Topic[] = [
  // ==================== PART 1 ====================
  
  // Work or Study
  { id: 'p1-ws-1', part: IeLtsPart.Part1, category: 'Work or Study', title: 'What is your major?' },
  { id: 'p1-ws-2', part: IeLtsPart.Part1, category: 'Work or Study', title: 'Why did you choose your major?' },
  { id: 'p1-ws-3', part: IeLtsPart.Part1, category: 'Work or Study', title: 'What is your favorite project/subject?' },
  { id: 'p1-ws-4', part: IeLtsPart.Part1, category: 'Work or Study', title: 'Do you prefer to study in the mornings or in the afternoons?' },
  { id: 'p1-ws-5', part: IeLtsPart.Part1, category: 'Work or Study', title: 'What is your typical workday like?' },
  { id: 'p1-ws-6', part: IeLtsPart.Part1, category: 'Work or Study', title: 'Do you like your job?' },
  
  // House or Apartment
  { id: 'p1-ha-1', part: IeLtsPart.Part1, category: 'House or Apartment', title: 'Do you live in an apartment or a house?' },
  { id: 'p1-ha-2', part: IeLtsPart.Part1, category: 'House or Apartment', title: 'What part of your home do you like the most?' },
  { id: 'p1-ha-3', part: IeLtsPart.Part1, category: 'House or Apartment', title: 'What makes you feel pleasant in your home?' },

  // Hometown
  { id: 'p1-ht-1', part: IeLtsPart.Part1, category: 'Hometown', title: 'What do you like about your hometown?' },
  { id: 'p1-ht-2', part: IeLtsPart.Part1, category: 'Hometown', title: 'Would you recommend visiting your hometown?' },
  { id: 'p1-ht-3', part: IeLtsPart.Part1, category: 'Hometown', title: 'What is your hometown famous for?' },
  { id: 'p1-ht-4', part: IeLtsPart.Part1, category: 'Hometown', title: 'Did you learn about the culture of your hometown in your childhood?' },

  // Patience
  { id: 'p1-pat-1', part: IeLtsPart.Part1, category: 'Patience', title: 'Are you a patient person?' },
  { id: 'p1-pat-2', part: IeLtsPart.Part1, category: 'Patience', title: 'What is it that makes you feel impatient?' },
  { id: 'p1-pat-3', part: IeLtsPart.Part1, category: 'Patience', title: 'How do you feel when you have to do something for a long time?' },
  { id: 'p1-pat-4', part: IeLtsPart.Part1, category: 'Patience', title: 'Does your job require you to be patient?' },

  // Memory
  { id: 'p1-mem-1', part: IeLtsPart.Part1, category: 'Memory', title: 'Are you good at memorising things?' },
  { id: 'p1-mem-2', part: IeLtsPart.Part1, category: 'Memory', title: 'Have you ever forgotten something important?' },
  { id: 'p1-mem-3', part: IeLtsPart.Part1, category: 'Memory', title: 'What do you need to remember in your daily life?' },

  // Encourage
  { id: 'p1-enc-1', part: IeLtsPart.Part1, category: 'Encourage', title: 'Have you had any achievements recently?' },
  { id: 'p1-enc-2', part: IeLtsPart.Part1, category: 'Encourage', title: 'How do you feel when you are praised?' },
  { id: 'p1-enc-3', part: IeLtsPart.Part1, category: 'Encourage', title: 'When was the last time you praised someone?' },
  { id: 'p1-enc-4', part: IeLtsPart.Part1, category: 'Encourage', title: 'Do you think parents should often praise their children?' },

  // Taking Photos
  { id: 'p1-pho-1', part: IeLtsPart.Part1, category: 'Taking Photos', title: 'Do you like taking photos?' },
  { id: 'p1-pho-2', part: IeLtsPart.Part1, category: 'Taking Photos', title: 'Do you take photos often?' },
  { id: 'p1-pho-3', part: IeLtsPart.Part1, category: 'Taking Photos', title: 'Do you ever print out the photos you take?' },
  { id: 'p1-pho-4', part: IeLtsPart.Part1, category: 'Taking Photos', title: 'Would you like to become a professional photographer?' },
  { id: 'p1-pho-5', part: IeLtsPart.Part1, category: 'Taking Photos', title: 'Have you ever taken photos with your family?' },

  // Flowers
  { id: 'p1-flw-1', part: IeLtsPart.Part1, category: 'Flowers', title: 'Do people in your country often send flowers to others?' },
  { id: 'p1-flw-2', part: IeLtsPart.Part1, category: 'Flowers', title: 'Do you know anyone who loves flowers?' },
  { id: 'p1-flw-3', part: IeLtsPart.Part1, category: 'Flowers', title: 'Are there a lot of flowers where you live?' },
  { id: 'p1-flw-4', part: IeLtsPart.Part1, category: 'Flowers', title: 'Do you love flowers?' },
  { id: 'p1-flw-5', part: IeLtsPart.Part1, category: 'Flowers', title: 'Do you take photos of flowers in your daily life?' },

  // Machine
  { id: 'p1-mac-1', part: IeLtsPart.Part1, category: 'Machines', title: 'What is your favourite machine in your home?' },
  { id: 'p1-mac-2', part: IeLtsPart.Part1, category: 'Machines', title: 'Do you think washing machines and sweeping machines are important?' },
  { id: 'p1-mac-3', part: IeLtsPart.Part1, category: 'Machines', title: 'Do you read the instructions before using a machine?' },
  { id: 'p1-mac-4', part: IeLtsPart.Part1, category: 'Machines', title: 'Do you think it is important to read instructions?' },

  // Stay up late
  { id: 'p1-sul-1', part: IeLtsPart.Part1, category: 'Stay up late', title: 'Do you often stay up late?' },
  { id: 'p1-sul-2', part: IeLtsPart.Part1, category: 'Stay up late', title: 'Did you stay up late when you were a kid?' },
  { id: 'p1-sul-3', part: IeLtsPart.Part1, category: 'Stay up late', title: 'What do you do when you stay up late?' },
  { id: 'p1-sul-4', part: IeLtsPart.Part1, category: 'Stay up late', title: 'What does it feel like the next morning if you stay up late?' },

  // Shoes
  { id: 'p1-sho-1', part: IeLtsPart.Part1, category: 'Shoes', title: 'Do you like buying shoes? How often?' },
  { id: 'p1-sho-2', part: IeLtsPart.Part1, category: 'Shoes', title: 'Have you ever bought shoes online?' },
  { id: 'p1-sho-3', part: IeLtsPart.Part1, category: 'Shoes', title: 'How much money do you usually spend on shoes?' },
  { id: 'p1-sho-4', part: IeLtsPart.Part1, category: 'Shoes', title: 'Which do you prefer, fashionable shoes or comfortable shoes?' },

  // Museum
  { id: 'p1-mus-1', part: IeLtsPart.Part1, category: 'Museum', title: 'Do you think museums are important?' },
  { id: 'p1-mus-2', part: IeLtsPart.Part1, category: 'Museum', title: 'Are there many museums in your hometown?' },
  { id: 'p1-mus-3', part: IeLtsPart.Part1, category: 'Museum', title: 'Do you often visit a museum?' },
  { id: 'p1-mus-4', part: IeLtsPart.Part1, category: 'Museum', title: 'When was the last time you visited a museum?' },

  // Crowded place
  { id: 'p1-cp-1', part: IeLtsPart.Part1, category: 'Crowded Place', title: 'Is the city where you live crowded?' },
  { id: 'p1-cp-2', part: IeLtsPart.Part1, category: 'Crowded Place', title: 'Is there a crowded place near where you live?' },
  { id: 'p1-cp-3', part: IeLtsPart.Part1, category: 'Crowded Place', title: 'Do you like crowded places?' },
  { id: 'p1-cp-4', part: IeLtsPart.Part1, category: 'Crowded Place', title: 'Do most people like crowded places?' },
  { id: 'p1-cp-5', part: IeLtsPart.Part1, category: 'Crowded Place', title: 'When was the last time you were in a crowded place?' },

  // Borrowing/Lending
  { id: 'p1-bl-1', part: IeLtsPart.Part1, category: 'Borrowing', title: 'Have you borrowed books from others?' },
  { id: 'p1-bl-2', part: IeLtsPart.Part1, category: 'Borrowing', title: 'Have you ever borrowed money from others?' },
  { id: 'p1-bl-3', part: IeLtsPart.Part1, category: 'Borrowing', title: 'Do you like to lend things to others?' },
  { id: 'p1-bl-4', part: IeLtsPart.Part1, category: 'Borrowing', title: 'How do you feel when people dont return things they borrowed from you?' },

  // Rules
  { id: 'p1-rul-1', part: IeLtsPart.Part1, category: 'Rules', title: 'Are there any rules for students at your school?' },
  { id: 'p1-rul-2', part: IeLtsPart.Part1, category: 'Rules', title: 'Do you think students would benefit from more rules?' },
  { id: 'p1-rul-3', part: IeLtsPart.Part1, category: 'Rules', title: 'Do you have a teacher who does his or her job very well?' },
  { id: 'p1-rul-4', part: IeLtsPart.Part1, category: 'Rules', title: 'Do you prefer to have more or fewer rules at school?' },

  // Growing vegetable/fruits
  { id: 'p1-veg-1', part: IeLtsPart.Part1, category: 'Vegetables', title: 'Are you interested in growing vegetables and fruits?' },
  { id: 'p1-veg-2', part: IeLtsPart.Part1, category: 'Vegetables', title: 'Is growing vegetables popular in your country?' },
  { id: 'p1-veg-3', part: IeLtsPart.Part1, category: 'Vegetables', title: 'Do many people grow vegetables in your city?' },
  { id: 'p1-veg-4', part: IeLtsPart.Part1, category: 'Vegetables', title: 'Do you think its easy to grow vegetables?' },
  { id: 'p1-veg-5', part: IeLtsPart.Part1, category: 'Vegetables', title: 'Should schools teach students how to grow vegetables?' },

  // Saying thank you
  { id: 'p1-thk-1', part: IeLtsPart.Part1, category: 'Thank You', title: 'Have you ever sent a thank you card to others?' },
  { id: 'p1-thk-2', part: IeLtsPart.Part1, category: 'Thank You', title: 'Do people in your country often say "thank you"?' },
  { id: 'p1-thk-3', part: IeLtsPart.Part1, category: 'Thank You', title: 'On what occasions do you say "thank you"?' },
  { id: 'p1-thk-4', part: IeLtsPart.Part1, category: 'Thank You', title: 'Why do people need to say "thank you"?' },

  // Doing something well
  { id: 'p1-well-1', part: IeLtsPart.Part1, category: 'Doing Well', title: 'Do you have an experience that you did something well?' },
  { id: 'p1-well-2', part: IeLtsPart.Part1, category: 'Doing Well', title: 'Do you have an experience that your teacher thought you did a good job?' },
  { id: 'p1-well-3', part: IeLtsPart.Part1, category: 'Doing Well', title: 'Do you often tell your friends when they do something well?' },
  
  // Having a break
  { id: 'p1-brk-1', part: IeLtsPart.Part1, category: 'Break', title: 'How often do you take a rest or a break?' },
  { id: 'p1-brk-2', part: IeLtsPart.Part1, category: 'Break', title: 'What do you usually do when you are resting?' },
  { id: 'p1-brk-3', part: IeLtsPart.Part1, category: 'Break', title: 'Do you take a nap when you are taking your rest?' },
  { id: 'p1-brk-4', part: IeLtsPart.Part1, category: 'Break', title: 'How do you feel after taking a nap?' },

  // Public place
  { id: 'p1-pp-1', part: IeLtsPart.Part1, category: 'Public Place', title: 'Have you ever talked with someone you dont know in public places?' },
  { id: 'p1-pp-2', part: IeLtsPart.Part1, category: 'Public Place', title: 'Do you wear headphones in public places?' },
  { id: 'p1-pp-3', part: IeLtsPart.Part1, category: 'Public Place', title: 'Would you like to see more public places near where you live?' },
  { id: 'p1-pp-4', part: IeLtsPart.Part1, category: 'Public Place', title: 'Do you often go to public places with your friends?' },

  // Happy things
  { id: 'p1-hap-1', part: IeLtsPart.Part1, category: 'Happy', title: 'What usually makes you feel happy?' },
  { id: 'p1-hap-2', part: IeLtsPart.Part1, category: 'Happy', title: 'Do you like sharing photos when youre happy?' },
  { id: 'p1-hap-3', part: IeLtsPart.Part1, category: 'Happy', title: 'Who do you like to share your happiness with?' },
  { id: 'p1-hap-4', part: IeLtsPart.Part1, category: 'Happy', title: 'Do you like hearing good news more or bad news more?' },

  // Mobile phone
  { id: 'p1-mob-1', part: IeLtsPart.Part1, category: 'Mobile Phone', title: 'What was your first mobile phone?' },
  { id: 'p1-mob-2', part: IeLtsPart.Part1, category: 'Mobile Phone', title: 'Do you often use your mobile phone for texting or calls?' },
  { id: 'p1-mob-3', part: IeLtsPart.Part1, category: 'Mobile Phone', title: 'Will you buy a new one in the future?' },
  { id: 'p1-mob-4', part: IeLtsPart.Part1, category: 'Mobile Phone', title: 'How has your mobile phone changed your life?' },

  // Chatting
  { id: 'p1-chat-1', part: IeLtsPart.Part1, category: 'Chatting', title: 'Do you like chatting with friends?' },
  { id: 'p1-chat-2', part: IeLtsPart.Part1, category: 'Chatting', title: 'What do you usually chat about with friends?' },
  { id: 'p1-chat-3', part: IeLtsPart.Part1, category: 'Chatting', title: 'Do you prefer to chat with a group of people or with only one friend?' },
  { id: 'p1-chat-4', part: IeLtsPart.Part1, category: 'Chatting', title: 'Do you prefer to communicate face-to-face or via social media?' },
  { id: 'p1-chat-5', part: IeLtsPart.Part1, category: 'Chatting', title: 'Do you argue with friends?' },

  // List
  { id: 'p1-list-1', part: IeLtsPart.Part1, category: 'List', title: 'Do you make a list when you shop?' },
  { id: 'p1-list-2', part: IeLtsPart.Part1, category: 'List', title: 'Do you make a list for your work? Does it work?' },
  { id: 'p1-list-3', part: IeLtsPart.Part1, category: 'List', title: 'Why dont some people like making lists?' },
  { id: 'p1-list-4', part: IeLtsPart.Part1, category: 'List', title: 'Do you prefer to make a list on paper or your phone?' },

  // Sharing
  { id: 'p1-share-1', part: IeLtsPart.Part1, category: 'Sharing', title: 'Did your parents teach you to share when you were a child?' },
  { id: 'p1-share-2', part: IeLtsPart.Part1, category: 'Sharing', title: 'What kind of things do you like to share with others?' },
  { id: 'p1-share-3', part: IeLtsPart.Part1, category: 'Sharing', title: 'What kind of things are not suitable for sharing?' },
  { id: 'p1-share-4', part: IeLtsPart.Part1, category: 'Sharing', title: 'Do you have anything to share with others recently?' },
  { id: 'p1-share-5', part: IeLtsPart.Part1, category: 'Sharing', title: 'Who is the first person you would like to share good news with?' },

  // Being busy
  { id: 'p1-busy-1', part: IeLtsPart.Part1, category: 'Busy', title: 'Are you often busy?' },
  { id: 'p1-busy-2', part: IeLtsPart.Part1, category: 'Busy', title: 'Why are you busy?' },
  { id: 'p1-busy-3', part: IeLtsPart.Part1, category: 'Busy', title: 'When are you busy?' },
  { id: 'p1-busy-4', part: IeLtsPart.Part1, category: 'Busy', title: 'Are you busier now than when you were a child?' },

  // Old people
  { id: 'p1-old-1', part: IeLtsPart.Part1, category: 'Old People', title: 'Have you ever worked with old people?' },
  { id: 'p1-old-2', part: IeLtsPart.Part1, category: 'Old People', title: 'Are you happy to work with people who are older than you?' },
  { id: 'p1-old-3', part: IeLtsPart.Part1, category: 'Old People', title: 'What are the benefits of being friends or working with old people?' },
  { id: 'p1-old-4', part: IeLtsPart.Part1, category: 'Old People', title: 'Do you enjoy spending time with old people?' },

  // Advertisement
  { id: 'p1-ads-1', part: IeLtsPart.Part1, category: 'Advertisement', title: 'Is there an advertisement that made an impression on you when you were a child?' },
  { id: 'p1-ads-2', part: IeLtsPart.Part1, category: 'Advertisement', title: 'Do you see a lot of advertising on trains or transport?' },
  { id: 'p1-ads-3', part: IeLtsPart.Part1, category: 'Advertisement', title: 'Do you like advertisements?' },

  // Housework
  { id: 'p1-hw-1', part: IeLtsPart.Part1, category: 'Housework', title: 'Do you do some cooking or help your family cook at home now?' },
  { id: 'p1-hw-2', part: IeLtsPart.Part1, category: 'Housework', title: 'Did you do some house cleaning when you were young?' },
  { id: 'p1-hw-3', part: IeLtsPart.Part1, category: 'Housework', title: 'Do you have breakfast at home every day?' },
  { id: 'p1-hw-4', part: IeLtsPart.Part1, category: 'Housework', title: 'Do you want to learn how to cook well?' },
  { id: 'p1-hw-5', part: IeLtsPart.Part1, category: 'Housework', title: 'Do you think your home is clean and tidy?' },
  { id: 'p1-hw-6', part: IeLtsPart.Part1, category: 'Housework', title: 'What housework do you like or dislike doing?' },


  // ==================== PART 2 & 3 ====================

  // 1. Persuasion
  {
    id: 'p2-persuade',
    part: IeLtsPart.Part2,
    title: 'Describe a person who persuaded you to do something',
    description: 'You should say:\n- When it happened\n- What he/she persuaded you to do\n- Why he/she persuaded you to do it\n- And explain whether you did it at last'
  },
  { id: 'p3-persuade-1', part: IeLtsPart.Part3, title: 'What impact does advertising have on children and their parents?', relatedTopicId: 'p2-persuade' },
  { id: 'p3-persuade-2', part: IeLtsPart.Part3, title: 'What do parents often persuade their children to do?', relatedTopicId: 'p2-persuade' },
  { id: 'p3-persuade-3', part: IeLtsPart.Part3, title: 'Who do children listen to more, their parents or their teachers?', relatedTopicId: 'p2-persuade' },
  { id: 'p3-persuade-4', part: IeLtsPart.Part3, title: 'What are some good ways to persuade children?', relatedTopicId: 'p2-persuade' },

  // 2. Important Decision
  {
    id: 'p2-decision',
    part: IeLtsPart.Part2,
    title: 'Describe an important decision made with the help of other people',
    description: 'You should say:\n- What the decision was\n- Why you made the decision\n- Who helped you make the decision\n- And how you felt about it'
  },
  { id: 'p3-decision-1', part: IeLtsPart.Part3, title: 'What kind of decisions do you think are meaningful?', relatedTopicId: 'p2-decision' },
  { id: 'p3-decision-2', part: IeLtsPart.Part3, title: 'What important decisions should be made by teenagers themselves?', relatedTopicId: 'p2-decision' },
  { id: 'p3-decision-3', part: IeLtsPart.Part3, title: 'Why are some people unwilling to make quick decisions?', relatedTopicId: 'p2-decision' },
  { id: 'p3-decision-4', part: IeLtsPart.Part3, title: 'Why do some people like to ask others for advice?', relatedTopicId: 'p2-decision' },

  // 3. Beautiful Object
  {
    id: 'p2-beautiful',
    part: IeLtsPart.Part2,
    title: 'Describe an object that you think is beautiful',
    description: 'You should say:\n- What it is\n- Where you saw it\n- What it looks like\n- And explain why you think it is beautiful'
  },
  { id: 'p3-beautiful-1', part: IeLtsPart.Part3, title: 'Do you think there are more beautiful things now than in the past?', relatedTopicId: 'p2-beautiful' },
  { id: 'p3-beautiful-2', part: IeLtsPart.Part3, title: 'What beautiful scenery spots are there in your country?', relatedTopicId: 'p2-beautiful' },
  { id: 'p3-beautiful-3', part: IeLtsPart.Part3, title: 'Why do you think people create beautiful things?', relatedTopicId: 'p2-beautiful' },
  { id: 'p3-beautiful-4', part: IeLtsPart.Part3, title: 'Why do many people go to scenic spots in person instead of just reading about them?', relatedTopicId: 'p2-beautiful' },

  // 4. Second-hand Website
  {
    id: 'p2-website',
    part: IeLtsPart.Part2,
    title: 'Describe a website that sells second-hand items',
    description: 'You should say:\n- What it is\n- How you found out about it\n- What you have bought from it\n- And explain whether you like it'
  },
  { id: 'p3-website-1', part: IeLtsPart.Part3, title: 'Why do people buy second-hand clothes?', relatedTopicId: 'p2-website' },
  { id: 'p3-website-2', part: IeLtsPart.Part3, title: 'What problems will occur if people dont recycle?', relatedTopicId: 'p2-website' },
  { id: 'p3-website-3', part: IeLtsPart.Part3, title: 'Should the government encourage people to recycle items?', relatedTopicId: 'p2-website' },
  { id: 'p3-website-4', part: IeLtsPart.Part3, title: 'How do people in your country recycle various items they dont want?', relatedTopicId: 'p2-website' },

  // 5. Waiting
  {
    id: 'p2-wait',
    part: IeLtsPart.Part2,
    title: 'Describe a time you made a decision to wait for something',
    description: 'You should say:\n- When it happened\n- What you waited for\n- Why you made the decision\n- And explain how you felt while waiting'
  },
  { id: 'p3-wait-1', part: IeLtsPart.Part3, title: 'What do people in your country often do while waiting?', relatedTopicId: 'p2-wait' },
  { id: 'p3-wait-2', part: IeLtsPart.Part3, title: 'Why do some people like a slow-paced life?', relatedTopicId: 'p2-wait' },
  { id: 'p3-wait-3', part: IeLtsPart.Part3, title: 'Is being patient good for people? Why?', relatedTopicId: 'p2-wait' },
  { id: 'p3-wait-4', part: IeLtsPart.Part3, title: 'Why do children lack patience?', relatedTopicId: 'p2-wait' },
  { id: 'p3-wait-5', part: IeLtsPart.Part3, title: 'Compared to the past, are people less patient now?', relatedTopicId: 'p2-wait' },

  // 6. Plan Activity
  {
    id: 'p2-plan',
    part: IeLtsPart.Part2,
    title: 'Describe a time when you made a plan to do an activity with a lot of people',
    description: 'You should say:\n- What it was\n- When and where you made it\n- What the activity was\n- And explain how you felt about the plan'
  },
  { id: 'p3-plan-1', part: IeLtsPart.Part3, title: 'What kind of plans do young people often make?', relatedTopicId: 'p2-plan' },
  { id: 'p3-plan-2', part: IeLtsPart.Part3, title: 'Why cant people always follow their plans?', relatedTopicId: 'p2-plan' },
  { id: 'p3-plan-3', part: IeLtsPart.Part3, title: 'Is it important to make plans?', relatedTopicId: 'p2-plan' },
  { id: 'p3-plan-4', part: IeLtsPart.Part3, title: 'Why is setting goals important in the workplace?', relatedTopicId: 'p2-plan' },
  { id: 'p3-plan-5', part: IeLtsPart.Part3, title: 'Do you think people should have personal life goals?', relatedTopicId: 'p2-plan' },

  // 7. Sky
  {
    id: 'p2-sky',
    part: IeLtsPart.Part2,
    title: 'Describe a time when you saw something in the sky (e.g. flying kites, birds, sunset, etc.)',
    description: 'You should say:\n- What you saw\n- Where/when you saw it\n- How long you saw it\n- And explain how you felt about the experience'
  },
  { id: 'p3-sky-1', part: IeLtsPart.Part3, title: 'Would people be willing to get up early to watch the sunrise?', relatedTopicId: 'p2-sky' },
  { id: 'p3-sky-2', part: IeLtsPart.Part3, title: 'What do people usually see in the sky in the daytime?', relatedTopicId: 'p2-sky' },
  { id: 'p3-sky-3', part: IeLtsPart.Part3, title: 'Why do some people like to watch stars at night?', relatedTopicId: 'p2-sky' },

  // 8. Argument
  {
    id: 'p2-argument',
    part: IeLtsPart.Part2,
    title: 'Describe an argument two of your friends had',
    description: 'You should say:\n- When it happened\n- What it was about\n- How it was solved\n- And how you felt about it'
  },
  { id: 'p3-argument-1', part: IeLtsPart.Part3, title: 'Do you think arguments are important?', relatedTopicId: 'p2-argument' },
  { id: 'p3-argument-2', part: IeLtsPart.Part3, title: 'Is it easier to have arguments with your family or with friends?', relatedTopicId: 'p2-argument' },
  { id: 'p3-argument-3', part: IeLtsPart.Part3, title: 'Do you think people should change the way they think when having arguments?', relatedTopicId: 'p2-argument' },

  // 9. Unusual Clothes
  {
    id: 'p2-clothes',
    part: IeLtsPart.Part2,
    title: 'Describe a person who you think wears unusual clothes',
    description: 'You should say:\n- Who this person is\n- How you knew this person\n- What his/her clothes are like\n- And explain why you think his/her clothes are unusual'
  },
  { id: 'p3-clothes-1', part: IeLtsPart.Part3, title: 'What kind of clothes do people wear in the workplace?', relatedTopicId: 'p2-clothes' },
  { id: 'p3-clothes-2', part: IeLtsPart.Part3, title: 'Do you think it is a good idea to buy clothes online?', relatedTopicId: 'p2-clothes' },
  { id: 'p3-clothes-3', part: IeLtsPart.Part3, title: 'Do you think style is more important than comfort?', relatedTopicId: 'p2-clothes' },

  // 10. Intelligent Person
  {
    id: 'p2-smart',
    part: IeLtsPart.Part2,
    title: 'Describe an intelligent person you know',
    description: 'You should say:\n- Who this person is\n- How you knew this person\n- What this person does\n- And explain why you think this person is intelligent'
  },
  { id: 'p3-smart-1', part: IeLtsPart.Part3, title: 'Why are some children more intelligent than others?', relatedTopicId: 'p2-smart' },
  { id: 'p3-smart-2', part: IeLtsPart.Part3, title: 'Who plays a more important role in child development, teachers or parents?', relatedTopicId: 'p2-smart' },
  { id: 'p3-smart-3', part: IeLtsPart.Part3, title: 'Do you think smart people tend to be selfish?', relatedTopicId: 'p2-smart' },

  // 11. Good Friend
  {
    id: 'p2-friend',
    part: IeLtsPart.Part2,
    title: 'Describe a good friend who is important to you',
    description: 'You should say:\n- Who he/she is\n- How/where you got to know him/her\n- How long you have known each other\n- And explain why he/she is important to you'
  },
  { id: 'p3-friend-1', part: IeLtsPart.Part3, title: 'How do children make friends at school?', relatedTopicId: 'p2-friend' },
  { id: 'p3-friend-2', part: IeLtsPart.Part3, title: 'Do you think it is better to have a few close friends or many casual friends?', relatedTopicId: 'p2-friend' },
  { id: 'p3-friend-3', part: IeLtsPart.Part3, title: 'What are the differences between friends made inside and outside the workplace?', relatedTopicId: 'p2-friend' },

  // 12. City Visit
  {
    id: 'p2-city',
    part: IeLtsPart.Part2,
    title: 'Describe a city that you have been to and would like to visit again',
    description: 'You should say:\n- When you visited it\n- What you did there\n- What it was like\n- And explain why you would like to visit it again'
  },
  { id: 'p3-city-1', part: IeLtsPart.Part3, title: 'Whats the difference between the city and the countryside?', relatedTopicId: 'p2-city' },
  { id: 'p3-city-2', part: IeLtsPart.Part3, title: 'Do you think it is possible that all of the population move to cities?', relatedTopicId: 'p2-city' },
  { id: 'p3-city-3', part: IeLtsPart.Part3, title: 'What should the government do to improve citizens safety?', relatedTopicId: 'p2-city' },
  
  // 13. Singer
  {
    id: 'p2-singer',
    part: IeLtsPart.Part2,
    title: 'Describe a singer whose music/songs you like',
    description: 'You should say:\n- Who he/she is\n- What genre his/her music belongs to\n- When/where you listen to his/her music\n- And explain why you like him/her'
  },
  { id: 'p3-singer-1', part: IeLtsPart.Part3, title: 'What kind of music do people like at different ages?', relatedTopicId: 'p2-singer' },
  { id: 'p3-singer-2', part: IeLtsPart.Part3, title: 'Why do some people like to listen to live music while others prefer CDs?', relatedTopicId: 'p2-singer' },
  { id: 'p3-singer-3', part: IeLtsPart.Part3, title: 'What should the government do to help people with musical talent?', relatedTopicId: 'p2-singer' },

  // 14. Bad Behavior
  {
    id: 'p2-bad-behavior',
    part: IeLtsPart.Part2,
    title: 'Describe a time when you saw children behave badly in public',
    description: 'You should say:\n- Where it was\n- What the children were doing\n- How others reacted to it\n- And explain how you felt about it'
  },
  { id: 'p3-bad-1', part: IeLtsPart.Part3, title: 'How should parents stop their children from behaving badly in public?', relatedTopicId: 'p2-bad-behavior' },
  { id: 'p3-bad-2', part: IeLtsPart.Part3, title: 'Are parents these days stricter than those in the past?', relatedTopicId: 'p2-bad-behavior' },
  { id: 'p3-bad-3', part: IeLtsPart.Part3, title: 'Whose influence on children is more important? Friends or parents?', relatedTopicId: 'p2-bad-behavior' },

  // 15. Health Article
  {
    id: 'p2-health',
    part: IeLtsPart.Part2,
    title: 'Describe an article on health you read in a magazine or on the Internet',
    description: 'You should say:\n- What it was\n- Where you read it\n- Why you read it\n- And how you felt about it'
  },
  { id: 'p3-health-1', part: IeLtsPart.Part3, title: 'Do you think people are healthier now than in the past?', relatedTopicId: 'p2-health' },
  { id: 'p3-health-2', part: IeLtsPart.Part3, title: 'How can you tell whether a website is reliable or not?', relatedTopicId: 'p2-health' },
  { id: 'p3-health-3', part: IeLtsPart.Part3, title: 'How do todays people keep healthy?', relatedTopicId: 'p2-health' },
  { id: 'p3-health-4', part: IeLtsPart.Part3, title: 'What can governments do to improve peoples health?', relatedTopicId: 'p2-health' },

  // 16. Old Person Interesting Life
  {
    id: 'p2-old-life',
    part: IeLtsPart.Part2,
    title: 'Describe an old person you know who has had an interesting life',
    description: 'You should say:\n- Who this person is\n- Where he/she lives\n- What he/she has done in his/her life\n- And explain how you felt about him/her'
  },
  { id: 'p3-old-life-1', part: IeLtsPart.Part3, title: 'What do old people often do in their daily lives?', relatedTopicId: 'p2-old-life' },
  { id: 'p3-old-life-2', part: IeLtsPart.Part3, title: 'Can old people and their grandchildren learn from each other?', relatedTopicId: 'p2-old-life' },
  { id: 'p3-old-life-3', part: IeLtsPart.Part3, title: 'Do you think old peoples life will improve with technology?', relatedTopicId: 'p2-old-life' },

  // 17. Funny Film
  {
    id: 'p2-film',
    part: IeLtsPart.Part2,
    title: 'Describe a film that made you laugh',
    description: 'You should say:\n- What it is\n- When you watched it\n- Who you watched it with\n- And explain why it made you laugh'
  },
  { id: 'p3-film-1', part: IeLtsPart.Part3, title: 'Do people like comedy?', relatedTopicId: 'p2-film' },
  { id: 'p3-film-2', part: IeLtsPart.Part3, title: 'Why do people of all ages like cartoons?', relatedTopicId: 'p2-film' },
  { id: 'p3-film-3', part: IeLtsPart.Part3, title: 'Should teachers tell jokes in class?', relatedTopicId: 'p2-film' },

  // 18. Conversation
  {
    id: 'p2-convo',
    part: IeLtsPart.Part2,
    title: 'Describe an impressive and interesting conversation you had that you remember well',
    description: 'You should say:\n- Who you talked to\n- When and where you had it\n- What you talked about\n- And explain why you think it was impressive'
  },
  { id: 'p3-convo-1', part: IeLtsPart.Part3, title: 'Is it important to have good communication skills at work?', relatedTopicId: 'p2-convo' },
  { id: 'p3-convo-2', part: IeLtsPart.Part3, title: 'What are the differences between talking with friends online and face-to-face?', relatedTopicId: 'p2-convo' },
  { id: 'p3-convo-3', part: IeLtsPart.Part3, title: 'Do you think old people can work better than young people?', relatedTopicId: 'p2-convo' },

  // 19. Product Ad
  {
    id: 'p2-ad-product',
    part: IeLtsPart.Part2,
    title: 'Describe an advertisement you have seen that introduced a well-known product',
    description: 'You should say:\n- When and where you saw it\n- What the product was\n- How you liked the advertisement\n- And explain how you felt about it'
  },
  { id: 'p3-ad-product-1', part: IeLtsPart.Part3, title: 'Where do we often see advertisements?', relatedTopicId: 'p2-ad-product' },
  { id: 'p3-ad-product-2', part: IeLtsPart.Part3, title: 'Are advertisements good or bad for children?', relatedTopicId: 'p2-ad-product' },
  { id: 'p3-ad-product-3', part: IeLtsPart.Part3, title: 'How does advertising affect people?', relatedTopicId: 'p2-ad-product' },

  // 20. Family Business
  {
    id: 'p2-business',
    part: IeLtsPart.Part2,
    title: 'Describe a person you know who runs/works a family business',
    description: 'You should say:\n- Who he/she is\n- What the business is\n- What products it sells\n- And explain what you have learned from him/her'
  },
  { id: 'p3-business-1', part: IeLtsPart.Part3, title: 'Would you like to start a family business?', relatedTopicId: 'p2-business' },
  { id: 'p3-business-2', part: IeLtsPart.Part3, title: 'What are the advantages and disadvantages of family businesses?', relatedTopicId: 'p2-business' },

  // 21. Dinner
  {
    id: 'p2-dinner',
    part: IeLtsPart.Part2,
    title: 'Describe a great dinner you and your friend or family members enjoyed',
    description: 'You should say:\n- What you had\n- Who you had the dinner with\n- What you talked about\n- And explain why you enjoyed it'
  },
  { id: 'p3-dinner-1', part: IeLtsPart.Part3, title: 'Is it common for students to dine with each other on school days?', relatedTopicId: 'p2-dinner' },
  { id: 'p3-dinner-2', part: IeLtsPart.Part3, title: 'Do people prefer to eat out or eat at home during festivals?', relatedTopicId: 'p2-dinner' },
  { id: 'p3-dinner-3', part: IeLtsPart.Part3, title: 'Is it a hassle to prepare a meal at home?', relatedTopicId: 'p2-dinner' },

  // 22. Useful Book
  {
    id: 'p2-book',
    part: IeLtsPart.Part2,
    title: 'Describe a book you read that you found useful',
    description: 'You should say:\n- What it is\n- When you read it\n- Why you think it is useful\n- And explain how you felt about it'
  },
  { id: 'p3-book-1', part: IeLtsPart.Part3, title: 'What are the types of books that young people like to read?', relatedTopicId: 'p2-book' },
  { id: 'p3-book-2', part: IeLtsPart.Part3, title: 'Whats the difference between paper books and e-books?', relatedTopicId: 'p2-book' },
  
  // 23. Toy
  {
    id: 'p2-toy',
    part: IeLtsPart.Part2,
    title: 'Describe a toy you liked in your childhood',
    description: 'You should say:\n- What kind of toy it is\n- When you received it\n- How you played it\n- And how you felt about it'
  },
  { id: 'p3-toy-1', part: IeLtsPart.Part3, title: 'How do advertisements influence children?', relatedTopicId: 'p2-toy' },
  { id: 'p3-toy-2', part: IeLtsPart.Part3, title: 'Do you think parents should buy more toys for their kids?', relatedTopicId: 'p2-toy' },
  { id: 'p3-toy-3', part: IeLtsPart.Part3, title: 'What are the advantages and disadvantages of modern toys?', relatedTopicId: 'p2-toy' },

  // 24. Traditional Story
  {
    id: 'p2-story',
    part: IeLtsPart.Part2,
    title: 'Describe an interesting traditional story',
    description: 'You should say:\n- What the story is about\n- When/how you knew it\n- Who told you the story\n- And explain how you felt when you first heard it'
  },
  { id: 'p3-story-1', part: IeLtsPart.Part3, title: 'What kind of stories do children like?', relatedTopicId: 'p2-story' },
  { id: 'p3-story-2', part: IeLtsPart.Part3, title: 'What are the benefits of bedtime stories for children?', relatedTopicId: 'p2-story' },
  { id: 'p3-story-3', part: IeLtsPart.Part3, title: 'Is a good storyline important for a movie?', relatedTopicId: 'p2-story' },

  // 25. Social Media
  {
    id: 'p2-social',
    part: IeLtsPart.Part2,
    title: 'Describe a time you saw something interesting on social media',
    description: 'You should say:\n- When it was\n- Where you saw it\n- What you saw\n- And explain why you think it was interesting'
  },
  { id: 'p3-social-1', part: IeLtsPart.Part3, title: 'Why do people like to use social media?', relatedTopicId: 'p2-social' },
  { id: 'p3-social-2', part: IeLtsPart.Part3, title: 'What are the advantages and disadvantages of using social media?', relatedTopicId: 'p2-social' },
  { id: 'p3-social-3', part: IeLtsPart.Part3, title: 'What do you think of making friends on social networks?', relatedTopicId: 'p2-social' },

  // 26. Electricity
  {
    id: 'p2-electricity',
    part: IeLtsPart.Part2,
    title: 'Describe a time when the electricity suddenly went off',
    description: 'You should say:\n- When/where it happened\n- How long it lasted\n- What you did during that time\n- And explain how you felt about it'
  },
  { id: 'p3-electricity-1', part: IeLtsPart.Part3, title: 'Do you think electric bicycles will replace ordinary bicycles?', relatedTopicId: 'p2-electricity' },
  { id: 'p3-electricity-2', part: IeLtsPart.Part3, title: 'Which is better, electric cars or petrol cars?', relatedTopicId: 'p2-electricity' },
  { id: 'p3-electricity-3', part: IeLtsPart.Part3, title: 'How did people manage to live without electricity in the ancient world?', relatedTopicId: 'p2-electricity' },

  // 27. Wild Animal
  {
    id: 'p2-animal',
    part: IeLtsPart.Part2,
    title: 'Describe a wild animal that you want to know more about',
    description: 'You should say:\n- What it is\n- When/where you saw it\n- And explain why you want to know more about it'
  },
  { id: 'p3-animal-1', part: IeLtsPart.Part3, title: 'Why should we protect wild animals?', relatedTopicId: 'p2-animal' },
  { id: 'p3-animal-2', part: IeLtsPart.Part3, title: 'Do you think its important to take children to the zoo to see animals?', relatedTopicId: 'p2-animal' },
  { id: 'p3-animal-3', part: IeLtsPart.Part3, title: 'How do animals help us today?', relatedTopicId: 'p2-animal' },

  // 28. Talent
  {
    id: 'p2-talent',
    part: IeLtsPart.Part2,
    title: 'Describe a natural talent (sports, music, etc.) you want to improve',
    description: 'You should say:\n- What it is\n- When you discovered it\n- How you want to improve it\n- And how you feel about it'
  },
  { id: 'p3-talent-1', part: IeLtsPart.Part3, title: 'What can parents do to help children improve their talents?', relatedTopicId: 'p2-talent' },
  { id: 'p3-talent-2', part: IeLtsPart.Part3, title: 'Why do people like to watch talent shows?', relatedTopicId: 'p2-talent' },
  { id: 'p3-talent-3', part: IeLtsPart.Part3, title: 'Do you think it is a bad thing if a person is too talented?', relatedTopicId: 'p2-talent' },

  // 29. Lost Way
  {
    id: 'p2-lost',
    part: IeLtsPart.Part2,
    title: 'Describe an occasion when you lost your way',
    description: 'You should say:\n- Where you were\n- What happened\n- How you felt\n- And explain how you found your way'
  },
  { id: 'p3-lost-1', part: IeLtsPart.Part3, title: 'Why do some people get lost more easily than others?', relatedTopicId: 'p2-lost' },
  { id: 'p3-lost-2', part: IeLtsPart.Part3, title: 'Do you think it is important to be able to read a map?', relatedTopicId: 'p2-lost' },
  { id: 'p3-lost-3', part: IeLtsPart.Part3, title: 'How can people find their way when they are lost?', relatedTopicId: 'p2-lost' },

  // 30. Teaching Skill
  {
    id: 'p2-teach',
    part: IeLtsPart.Part2,
    title: 'Describe a skill that you think you can teach other people',
    description: 'You should say:\n- What it is\n- When you learned it\n- How you can teach others\n- And how you feel about this skill'
  },
  { id: 'p3-teach-1', part: IeLtsPart.Part3, title: 'What qualities should teachers have?', relatedTopicId: 'p2-teach' },
  { id: 'p3-teach-2', part: IeLtsPart.Part3, title: 'Which is more important, practical skills or academic skills?', relatedTopicId: 'p2-teach' },
  { id: 'p3-teach-3', part: IeLtsPart.Part3, title: 'What are the differences between online and face-to-face teaching?', relatedTopicId: 'p2-teach' },

  // 31. Outdoor Sport
  {
    id: 'p2-sport',
    part: IeLtsPart.Part2,
    title: 'Describe an outdoor sport you would like to do',
    description: 'You should say:\n- What it is\n- When/where you would like to do it\n- With whom you would like to do it\n- And explain why you would like to do it'
  },
  { id: 'p3-sport-1', part: IeLtsPart.Part3, title: 'What are the differences between indoor sports and outdoor sports?', relatedTopicId: 'p2-sport' },
  { id: 'p3-sport-2', part: IeLtsPart.Part3, title: 'Which outdoor sports are popular in China?', relatedTopicId: 'p2-sport' },
  { id: 'p3-sport-3', part: IeLtsPart.Part3, title: 'How does weather affect outdoor sports?', relatedTopicId: 'p2-sport' },

  // 32. Sports Event (Audience)
  {
    id: 'p2-audience',
    part: IeLtsPart.Part2,
    title: 'Describe a sports event that you would like to attend as part of the audience',
    description: 'You should say:\n- What it is\n- Who you want to watch with\n- Why you want to be part of the audience\n- And explain how you feel about it'
  },
  { id: 'p3-audience-1', part: IeLtsPart.Part3, title: 'Do encouragement and applause from the audience have an impact on athletes?', relatedTopicId: 'p2-audience' },
  { id: 'p3-audience-2', part: IeLtsPart.Part3, title: 'Which do people prefer to watch, team sports or individual sports?', relatedTopicId: 'p2-audience' },
  { id: 'p3-audience-3', part: IeLtsPart.Part3, title: 'Why do so many children like to watch basketball games?', relatedTopicId: 'p2-audience' },

  // 33. Shop/Service
  {
    id: 'p2-shop',
    part: IeLtsPart.Part2,
    title: 'Describe a shop/store you often visit OR a time you received good service',
    description: 'You should say:\n- What the shops name is\n- Where it is\n- How often you visit it\n- And explain why you like to visit it'
  },
  { id: 'p3-shop-1', part: IeLtsPart.Part3, title: 'How have peoples shopping habits changed in recent decades?', relatedTopicId: 'p2-shop' },
  { id: 'p3-shop-2', part: IeLtsPart.Part3, title: 'What are the differences between shopping in street markets and in big shopping malls?', relatedTopicId: 'p2-shop' },
  { id: 'p3-shop-3', part: IeLtsPart.Part3, title: 'What are the advantages and disadvantages of shopping online?', relatedTopicId: 'p2-shop' },

  // 34. Broken Thing
  {
    id: 'p2-broken',
    part: IeLtsPart.Part2,
    title: 'Describe an occasion when you broke something at home',
    description: 'You should say:\n- What it was\n- How you broke it\n- How you solved the problem\n- And explain how you felt about it'
  },
  { id: 'p3-broken-1', part: IeLtsPart.Part3, title: 'Why do people break things?', relatedTopicId: 'p2-broken' },
  { id: 'p3-broken-2', part: IeLtsPart.Part3, title: 'What kinds of things are easy to break?', relatedTopicId: 'p2-broken' },
  { id: 'p3-broken-3', part: IeLtsPart.Part3, title: 'Do older people like repairing things more than young people do?', relatedTopicId: 'p2-broken' },

  // 35. Interesting Building
  {
    id: 'p2-building',
    part: IeLtsPart.Part2,
    title: 'Describe an interesting building you saw during a trip',
    description: 'You should say:\n- Where you saw it\n- What it looks like\n- What you have known about it\n- And explain why you think it is interesting'
  },
  { id: 'p3-building-1', part: IeLtsPart.Part3, title: 'Should all scenic spots charge an entry fee?', relatedTopicId: 'p2-building' },
  { id: 'p3-building-2', part: IeLtsPart.Part3, title: 'Why do some people like to live in big cities?', relatedTopicId: 'p2-building' },
  { id: 'p3-building-3', part: IeLtsPart.Part3, title: 'Is it necessary for tourists to go to visit landmarks?', relatedTopicId: 'p2-building' },

  // 36. Creative Person
  {
    id: 'p2-creative',
    part: IeLtsPart.Part2,
    title: 'Describe a creative person (e.g. an artist, a musician, etc.) you admire',
    description: 'You should say:\n- Who he/she is\n- How you knew him/her\n- What his/her greatest achievement is\n- And explain why you think he/she is creative'
  },
  { id: 'p3-creative-1', part: IeLtsPart.Part3, title: 'How do artists acquire inspiration?', relatedTopicId: 'p2-creative' },
  { id: 'p3-creative-2', part: IeLtsPart.Part3, title: 'What can we do to help children keep creative?', relatedTopicId: 'p2-creative' },

  // 37. Apology
  {
    id: 'p2-apology',
    part: IeLtsPart.Part2,
    title: 'Describe a time when someone apologized to you',
    description: 'You should say:\n- When it was\n- Who this person is\n- Why he or she apologized to you\n- And how you felt about it'
  },
  { id: 'p3-apology-1', part: IeLtsPart.Part3, title: 'Do you think people should apologize for anything wrong they do?', relatedTopicId: 'p2-apology' },
  { id: 'p3-apology-2', part: IeLtsPart.Part3, title: 'Do people in your country like to say "sorry"?', relatedTopicId: 'p2-apology' },

  // 38. Science Subject
  {
    id: 'p2-science',
    part: IeLtsPart.Part2,
    title: 'Describe an area/subject of science that you are interested in',
    description: 'You should say:\n- Which area/subject it is\n- When and where you came to know this\n- How you get information about this\n- And explain why you are interested in it'
  },
  { id: 'p3-science-1', part: IeLtsPart.Part3, title: 'Why do some children not like learning science at school?', relatedTopicId: 'p2-science' },
  { id: 'p3-science-2', part: IeLtsPart.Part3, title: 'Is it important to study science at school?', relatedTopicId: 'p2-science' },
  { id: 'p3-science-3', part: IeLtsPart.Part3, title: 'Should scientists explain the research process to the public?', relatedTopicId: 'p2-science' },

  // 39. Adventure / Change Plan (Core Template)
  {
    id: 'p2-adventure-plan',
    part: IeLtsPart.Part2,
    title: 'Describe a dangerous situation I experienced during a trip OR a time you changed plans',
    description: 'You should say:\n- When it happened\n- Where you were\n- What happened\n- And explain how you felt about it'
  },
  { id: 'p3-adventure-1', part: IeLtsPart.Part3, title: 'What do you do to prevent danger when traveling?', relatedTopicId: 'p2-adventure-plan' }
];
