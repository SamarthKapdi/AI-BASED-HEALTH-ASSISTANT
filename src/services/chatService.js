import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Save chat message to Firestore
// context: 'chat' (default) or 'mental' to keep histories separate
export const saveChatMessage = async (userId, message, role, context = 'chat') => {
  try {
    const chatRef = collection(db, 'chats');
    await addDoc(chatRef, {
      userId,
      message,
      role, // 'user' or 'assistant'
      context,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

// Get chat history for a user
// context: 'chat' or 'mental'. Also returns legacy records with no context (treated as 'chat').
export const getChatHistory = async (userId, context = 'chat', limit = 50) => {
  try {
    const chatRef = collection(db, 'chats');
    // helper to sort by timestamp/createdAt asc
    const sortAsc = (arr) => arr.sort((a, b) => {
      const ta = a.timestamp?.seconds ? a.timestamp.seconds : Date.parse(a.createdAt || 0);
      const tb = b.timestamp?.seconds ? b.timestamp.seconds : Date.parse(b.createdAt || 0);
      return (ta || 0) - (tb || 0);
    });
    try {
      const q = query(
        chatRef,
        where('userId', '==', userId),
        where('context', '==', context),
        orderBy('timestamp', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      // If no messages found with context, fall back to legacy (no context) records
      if (messages.length === 0 && context === 'chat') {
        const qLegacy = query(chatRef, where('userId', '==', userId));
        const legacySnap = await getDocs(qLegacy);
        const legacy = [];
        legacySnap.forEach((doc) => {
          legacy.push({ id: doc.id, ...doc.data() });
        });
        return sortAsc(legacy);
      }
      return messages;
    } catch (err) {
      // Fallback if composite index is missing: fetch unordered then sort client-side
      if (err?.code === 'failed-precondition') {
        const qNoOrder = query(chatRef, where('userId', '==', userId), where('context', '==', context));
        const snapshot = await getDocs(qNoOrder);
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        if (messages.length === 0 && context === 'chat') {
          const qLegacy = query(chatRef, where('userId', '==', userId));
          const legacySnap = await getDocs(qLegacy);
          const legacy = [];
          legacySnap.forEach((doc) => legacy.push({ id: doc.id, ...doc.data() }));
          return sortAsc(legacy);
        }
        return sortAsc(messages);
      }
      throw err;
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

// Save symptom analysis to history
export const saveSymptomAnalysis = async (userId, symptoms, analysis) => {
  try {
    const analysisRef = collection(db, 'symptomAnalysis');
    await addDoc(analysisRef, {
      userId,
      symptoms,
      analysis,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving symptom analysis:', error);
    throw error;
  }
};

// Get symptom analysis history
export const getSymptomHistory = async (userId) => {
  try {
    const analysisRef = collection(db, 'symptomAnalysis');
    try {
      const q = query(
        analysisRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      return history;
    } catch (err) {
      if (err?.code === 'failed-precondition') {
        const qNoOrder = query(analysisRef, where('userId', '==', userId));
        const snapshot = await getDocs(qNoOrder);
        const history = [];
        snapshot.forEach((doc) => {
          history.push({ id: doc.id, ...doc.data() });
        });
        return history.sort((a, b) => {
          const ta = a.timestamp?.seconds ? a.timestamp.seconds : Date.parse(a.createdAt || 0);
          const tb = b.timestamp?.seconds ? b.timestamp.seconds : Date.parse(b.createdAt || 0);
          return (tb || 0) - (ta || 0); // desc
        });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error fetching symptom history:', error);
    throw error;
  }
};
