import { ref, watch } from 'vue';

const STORAGE_KEY = 'telegram-ghost-recipients';
const MAX_HISTORY = 20;

interface RecipientHistory {
  recipients: string[];
}

const history = ref<string[]>([]);

// Load history from localStorage
const loadHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: RecipientHistory = JSON.parse(stored);
      history.value = parsed.recipients || [];
    }
  } catch (error) {
    console.error('Failed to load recipient history:', error);
    history.value = [];
  }
};

// Save history to localStorage
const saveHistory = () => {
  try {
    const data: RecipientHistory = { recipients: history.value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save recipient history:', error);
  }
};

// Add recipient to history
const addRecipient = (recipient: string) => {
  if (!recipient || recipient.trim() === '') return;
  
  const normalizedRecipient = recipient.trim();
  
  // Remove if already exists
  history.value = history.value.filter(r => r !== normalizedRecipient);
  
  // Add to beginning
  history.value.unshift(normalizedRecipient);
  
  // Limit to max items
  if (history.value.length > MAX_HISTORY) {
    history.value = history.value.slice(0, MAX_HISTORY);
  }
  
  saveHistory();
};

// Clear all history
const clearHistory = () => {
  history.value = [];
  localStorage.removeItem(STORAGE_KEY);
};

// Remove specific recipient from history
const removeRecipient = (recipient: string) => {
  history.value = history.value.filter(r => r !== recipient);
  saveHistory();
};

// Load history on first use
loadHistory();

// Watch for changes and save
watch(history, saveHistory, { deep: true });

export function useRecipientHistory() {
  return {
    history,
    addRecipient,
    clearHistory,
    removeRecipient,
  };
}
