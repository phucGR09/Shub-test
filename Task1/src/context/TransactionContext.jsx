import React, { createContext, useContext, useReducer, useEffect } from 'react';

// localStorage keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'gas_station_transactions',
  FILE_INFO: 'gas_station_file_info',
  FILTERS: 'gas_station_filters'
};

// localStorage utility functions
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return null;
  }
};

const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
};

// Transaction context
const TransactionContext = createContext();

// Action types
export const TRANSACTION_ACTIONS = {
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_FILE_INFO: 'SET_FILE_INFO',
  CLEAR_DATA: 'CLEAR_DATA',
  RESTORE_DATA: 'RESTORE_DATA'
};

// Initial state
const initialState = {
  transactions: [],
  loading: false,
  error: null,
  fileInfo: null,
  isRestored: false
};

// Reducer
const transactionReducer = (state, action) => {
  switch (action.type) {
    case TRANSACTION_ACTIONS.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
        loading: false,
        error: null
      };

    case TRANSACTION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case TRANSACTION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case TRANSACTION_ACTIONS.SET_FILE_INFO:
      return {
        ...state,
        fileInfo: action.payload
      };

    case TRANSACTION_ACTIONS.CLEAR_DATA:
      return {
        ...initialState,
        isRestored: state.isRestored
      };

    case TRANSACTION_ACTIONS.RESTORE_DATA:
      return {
        ...state,
        transactions: action.payload.transactions || [],
        fileInfo: action.payload.fileInfo || null,
        isRestored: true
      };

    default:
      return state;
  }
};

// Provider component
export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  // Restore data from localStorage on mount
  useEffect(() => {
    const restoreData = () => {
      try {
        const savedTransactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
        const savedFileInfo = loadFromStorage(STORAGE_KEYS.FILE_INFO);

        if (savedTransactions && Array.isArray(savedTransactions) && savedTransactions.length > 0) {
          // Convert date strings back to Date objects
          const restoredTransactions = savedTransactions.map(transaction => ({
            ...transaction,
            ngay: transaction.ngay ? new Date(transaction.ngay) : null
          }));

          dispatch({
            type: TRANSACTION_ACTIONS.RESTORE_DATA,
            payload: {
              transactions: restoredTransactions,
              fileInfo: savedFileInfo
            }
          });
        }
      } catch (error) {
        console.warn('Failed to restore data from localStorage:', error);
      }
    };

    restoreData();
  }, []);

  const actions = {
    setTransactions: (transactions) => {
      dispatch({
        type: TRANSACTION_ACTIONS.SET_TRANSACTIONS,
        payload: transactions
      });
      // Save to localStorage
      saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    },

    setLoading: (loading) => {
      dispatch({
        type: TRANSACTION_ACTIONS.SET_LOADING,
        payload: loading
      });
    },

    setError: (error) => {
      dispatch({
        type: TRANSACTION_ACTIONS.SET_ERROR,
        payload: error
      });
    },

    setFileInfo: (fileInfo) => {
      dispatch({
        type: TRANSACTION_ACTIONS.SET_FILE_INFO,
        payload: fileInfo
      });
      // Save to localStorage
      saveToStorage(STORAGE_KEYS.FILE_INFO, fileInfo);
    },

    clearData: () => {
      dispatch({ type: TRANSACTION_ACTIONS.CLEAR_DATA });
      // Clear from localStorage
      removeFromStorage(STORAGE_KEYS.TRANSACTIONS);
      removeFromStorage(STORAGE_KEYS.FILE_INFO);
      removeFromStorage(STORAGE_KEYS.FILTERS);
    }
  };

  return (
    <TransactionContext.Provider value={{ ...state, ...actions }}>
      {children}
    </TransactionContext.Provider>
  );
};

// Hook to use transaction context
export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within TransactionProvider');
  }
  return context;
};
