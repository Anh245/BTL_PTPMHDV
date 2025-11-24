import axios from 'axios';

const API_URL = 'http://localhost:8000/api/trains';

export const getTrains = () => axios.get(API_URL);
export const getTrainById = (id) => axios.get(`${API_URL}/${id}`);
export const createTrain = (data) => axios.post(API_URL, data);
export const updateTrain = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteTrain = (id) => axios.delete(`${API_URL}/${id}`);
export const updateTrainStatus = (id, status) => axios.patch(`${API_URL}/${id}/status`, { status });
