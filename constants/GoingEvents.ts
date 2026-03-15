export type EventData = {
  id: string;
  name: string;
  location: string;
  date: string;
  image: string;
};

let userGoingEvents: EventData[] = [];

export function addGoingEvent(event: EventData) {
  if (!userGoingEvents.find(e => e.id === event.id)) {
    userGoingEvents = [event, ...userGoingEvents];
  }
}

export function getGoingEvents(): EventData[] {
  return [...userGoingEvents];
}
