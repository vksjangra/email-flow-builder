import axios from "axios";

const API_URL = "http://localhost:5000/api/flows";

export const getFlows = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getFlowById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createFlow = async (flowData) => {
    const response = await axios.post(API_URL, flowData);
    return response.data;
};

export const updateFlow = async (id, flowData) => {
    const response = await axios.put(`${API_URL}/${id}`, flowData);
    return response.data;
};

export const deleteFlow = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
}