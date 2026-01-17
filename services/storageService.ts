
import { Topic, MockExamResult } from '../types';
import { INITIAL_TOPICS } from '../constants';

const TOPICS_KEY = 'ielts_pro_topics_v1';
const HISTORY_KEY = 'ielts_pro_history_v1';

export const loadTopics = (): Topic[] => {
  try {
    const stored = localStorage.getItem(TOPICS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to load topics from storage", e);
  }
  return INITIAL_TOPICS;
};

export const saveTopics = (topics: Topic[]) => {
  try {
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  } catch (e) {
    console.error("Failed to save topics", e);
  }
};

export const loadMockHistory = (): MockExamResult[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const saveMockHistory = (history: MockExamResult[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};
