import { useState, useEffect } from 'react';
import * as trainService from '../services/trainService';

export default function useTrains() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrains = async () => {
    try {
      const res = await trainService.getTrains();
      setTrains(res.data);
    } catch (err) {
      console.error('Error loading trains:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  return { trains, loading, fetchTrains };
}
