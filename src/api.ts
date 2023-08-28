import axios from "axios";

export const getExhibition = (exhibition_id: number) => axios.get(`/api/ticket/project/get?version=134&id=${exhibition_id}&project_id=${exhibition_id}`, {})