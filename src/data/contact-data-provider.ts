import { fetchUtils } from "react-admin";

const url = "http://localhost:3000/api/contact";
const httpClient = fetchUtils.fetchJson;

export const contactDataProvider = {
  getList: async (params = { pagination: { page: 1, perPage: 10 }, sort: { field: "id", order: "ASC" }, filter: {} }) => {
    const { pagination } = params;

    if (!pagination) {
        console.error("Pagination is undefined");
        return { data: [], total: 0 };
    }

    const { page, perPage } = pagination;

    
    const { json } = await httpClient(url);

    
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = json.slice(start, end);

    return {
        data: paginatedData.map((message: any) => ({
            id: message.message_id,
            ...message,
        })),
        total: json.length, 
    };
  },



  getOne: async (params: any) => {
    const { json } = await httpClient(`${url}/${params.id}`);

    return {
      data: json.map((message: any) => ({
        id: message.message_id,
        ...message,
      })),
      total: json.length,
    };
  },

  delete: async (params: any) => {
    const { json } = await httpClient(`${url}/${params.id}`, {
      method: "DELETE",
    });
    return { data: json };
  },
};
