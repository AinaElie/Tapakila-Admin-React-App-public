import { fetchUtils } from "react-admin";
import { stringify } from "query-string";

interface Event {
    event_id: string;
    event_name: string;
    event_date: string;
    event_place: string;
    event_category: string;
    event_description: string;
    event_image?: string;
    event_organizer?: string;
    event_status: string;
    available_tickets?: number;
    total_tickets?: number;
}

interface EventParams {
    pagination: { page: number; perPage: number };
    sort: { field: string; order: string };
    filter: Record<string, any>;
}

interface TicketStats {
    vipCount: number;
    standardCount: number;
    earlyBirdCount: number;
    total: number;
    ticketsNumber: number;
}

interface GetTicketsParams {
    eventId: string;
    status?: string;
}

enum TicketType {
  VIP = "VIP",
  STANDARD = "STANDARD",
  EARLY_BIRD = "EARLY_BIRD"
}

interface CreateTicketsParams {
    ticketNumber: number;
    idEvent: string;
    ticket_type: TicketType;
    ticketPrice: number;
}

interface DeleteTicketsParams {
    ticketNumber: number;
    event_id: string;
    ticket_type?: TicketType;
}

const apiUrl = "http://localhost:3000/api/events";
const ticketsApiUrl = "http://localhost:3000/api/tickets";
const httpClient = fetchUtils.fetchJson;

const handleError = (error: any, message: string) => {
    console.error(message, error);
    throw new Error(message);
};

const eventsDataProvider = {
    getTicketsForEvent: async (params: GetTicketsParams): Promise<number> => {
        try {
            const query = {
                idEvent: params.eventId,
                ...(params.status && { status: params.status })
            };
            const { json: tickets } = await httpClient(`${ticketsApiUrl}?${stringify(query)}`);
            const count = tickets.tickets?.length || 0;
            return count;
        } catch (error) {
            console.error('Error fetching tickets:', error);
            return 0;
        }
    },

    getTotalTicketsForEvent: async (eventId: string): Promise<number> => {
        try {
            const { json: tickets } = await httpClient(`${ticketsApiUrl}?idEvent=${eventId}`);
            return tickets.tickets?.length || 0;
        } catch (error) {
            console.error('Error fetching total tickets:', error);
            return 0;
        }
    },

    processEventData: async (event: Event) => {
        const availableTickets = await eventsDataProvider.getTicketsForEvent({
            eventId: event.event_id,
            status: 'AVAILABLE'
        });
        const totalTickets = await eventsDataProvider.getTotalTicketsForEvent(event.event_id);
        return {
            id: event.event_id,
            ...event,
            available_tickets: availableTickets,
            total_tickets: totalTickets
        };
    },

    getList: async (_resource: string, params: EventParams) => {
        try {
            const { json } = await httpClient(`${apiUrl}?${stringify(params.filter)}`);
            const processedEvents = await Promise.all(json.map(eventsDataProvider.processEventData));
            
            return {
                data: processedEvents,
                total: json.length,
            };
        } catch (error) {
            handleError(error, 'Failed to fetch events');
        }
    },

    getOne: async (_resource: string, params: { id: string }) => {
        try {
            const { json } = await httpClient(`${apiUrl}/${params.id}`);
            const processedEvent = await eventsDataProvider.processEventData(json);
            return { data: processedEvent };
        } catch (error) {
            handleError(error, 'Failed to fetch event');
        }
    },

    getMany: async (_resource: string, params: { ids: string[] }) => {
        try {
            const { json } = await httpClient(`${apiUrl}?${stringify({ id: params.ids })}`);
            const processedEvents = await Promise.all(json.map(eventsDataProvider.processEventData));
            return { data: processedEvents };
        } catch (error) {
            handleError(error, 'Failed to fetch events');
        }
    },

    getManyReference: async (_resource: string, params: { target: string; id: string; filter: any }) => {
        try {
            const query = {
                ...params.filter,
                [params.target]: params.id,
            };
            const { json } = await httpClient(`${apiUrl}?${stringify(query)}`);
            const processedEvents = await Promise.all(json.map(eventsDataProvider.processEventData));
            return {
                data: processedEvents,
                total: json.length,
            };
        } catch (error) {
            handleError(error, 'Failed to fetch referenced events');
        }
    },

    create: async (_resource: string, params: { data: any }) => {
        try {
            const eventData = {
                event_name: params.data.event_name,
                event_date: params.data.event_date,
                event_place: params.data.event_place,
                event_category: params.data.event_category,
                event_description: params.data.event_description,
                event_image: params.data.event_image,
                event_organizer: params.data.event_organizer,
                event_status: params.data.event_status || 'DRAFT'
            };

            const { json } = await httpClient(`${apiUrl}`, {
                method: 'POST',
                body: JSON.stringify(eventData),
            });
            
            const processedEvent = await eventsDataProvider.processEventData(json);
            return { data: processedEvent };
        } catch (error) {
            handleError(error, 'Failed to create event');
        }
    },

    update: async (_resource: string, params: { id: string; data: any; previousData: any }) => {
        try {
            const updateData = {
                event_name: params.data.event_name,
                event_date: params.data.event_date,
                event_place: params.data.event_place,
                event_category: params.data.event_category,
                event_description: params.data.event_description,
                event_image: params.data.event_image,
                event_organizer: params.data.event_organizer,
                event_status: params.data.event_status
            };

            const { json } = await httpClient(`${apiUrl}/${params.id}`, {
                method: 'PUT',
                body: JSON.stringify(updateData),
            });

            if (!json || !json.event_id) {
                throw new Error('Invalid response from server');
            }

            const processedEvent = await eventsDataProvider.processEventData(json);
            return { data: processedEvent };
        } catch (error) {
            console.error('Update error:', error);
            handleError(error, 'Failed to update event');
        }
    },

    updateMany: async (_resource: string, params: { ids: string[]; data: any }) => {
        try {
            const responses = await Promise.all(
                params.ids.map(id =>
                    httpClient(`${apiUrl}/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify(params.data),
                    })
                )
            );
            return { data: responses.map(response => response.json.event_id) };
        } catch (error) {
            handleError(error, 'Failed to update events');
        }
    },

    delete: async (_resource: string, params: { id: string }) => {
        try {
            const { json } = await httpClient(`${apiUrl}/${params.id}`, {
                method: 'DELETE',
            });
            return { data: json };
        } catch (error) {
            handleError(error, 'Failed to delete event');
        }
    },

    deleteMany: async (_resource: string, params: { ids: string[] }) => {
        try {
            const responses = await Promise.all(
                params.ids.map(id =>
                    httpClient(`${apiUrl}/${id}`, {
                        method: 'DELETE',
                    })
                )
            );
            return { data: responses.map(response => response.json.event_id) };
        } catch (error) {
            handleError(error, 'Failed to delete events');
        }
    },

    createTickets: async (params: CreateTicketsParams) => {
        try {
            const { json } = await httpClient(`${ticketsApiUrl}`, {
                method: 'POST',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    ticketNumber: params.ticketNumber,
                    idEvent: params.idEvent,
                    ticket_type: params.ticket_type,
                    ticketPrice: params.ticketPrice
                }),
            });
            return json;
        } catch (error) {
            console.error('Error in createTickets:', error);
            if ((error as any).status === 400) {
                const errorMessage = (error as any).body?.error || 'Erreur de validation: vérifiez les champs du formulaire';
                throw new Error(errorMessage);
            }
            throw new Error(`Erreur lors de la création des tickets: ${(error as any).message || 'Erreur inconnue'}`);
        }
    },

    deleteTickets: async (params: DeleteTicketsParams) => {
        try {
            const queryParams = new URLSearchParams({
                ticketNumber: params.ticketNumber.toString(),
                event_id: params.event_id,
                ...(params.ticket_type && { ticket_type: params.ticket_type })
            });

            const { json } = await httpClient(`${ticketsApiUrl}?${queryParams}`, {
                method: 'DELETE',
            });

            return json;
        } catch (error: any) {
            if (error.body) {
                throw new Error(error.body.error || 'Erreur lors de la suppression des tickets');
            }
            throw error;
        }
    },
};

export type { CreateTicketsParams, DeleteTicketsParams, Event, EventParams, TicketStats, GetTicketsParams };
export { TicketType, eventsDataProvider };
