import React, {createContext, useContext, useState} from 'react';
import api from '../api/api.js';

export const SearchContext = createContext();

export const SearchProvider = ({children}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async text => {
    setQuery(text);
    setLoading(true);

    if (text.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/api/v1/customer/search?query=${text}`);
      console.log('Search results:', res.data);
      setResults(res.data);
    } catch (error) {
      console.log('Error Fetching Customers : ', error);
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <SearchContext.Provider value={{query, results, loading, handleSearch}}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
