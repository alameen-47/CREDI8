import React, {createContext, useContext, useState} from 'react';
import api from '../services/api.js';
import {AuthContext} from './auth.js';

export const SearchContext = createContext();

export const SearchProvider = ({children}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const {auth} = useContext(AuthContext);
  const userId = auth?.user?._id;

  const handleSearch = async text => {
    setQuery(text);

    if (!text || text.trim().length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/api/v1/customer/search', {
        params: {query: text.trim(), userId},
      });
      // API returns an array directly
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setLoading(false);
  };

  return (
    <SearchContext.Provider
      value={{query, results, loading, handleSearch, clearSearch}}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
