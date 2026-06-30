import axios from "axios";
import { io } from "socket.io-client";

const API = axios.create({
    baseURL: "https://foodbridge-43uu.onrender.com"
});

export const socket = io("https://foodbridge-43uu.onrender.com");

export default API;