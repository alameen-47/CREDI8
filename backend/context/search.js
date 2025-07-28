import React, {createContext, useContext, useState} from 'react';
import api from '../api/api.js';
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
    setLoading(true);
    if (text.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(
        `/api/v1/customer/search?query=${text}&userId=${userId}`,
      );
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
