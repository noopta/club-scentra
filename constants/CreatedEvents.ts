export type EventData = {
  id: string;
  name: string;
  location: string;
  date: string;
  image: string;
};

let createdEvents: EventData[] = [];

export function addCreatedEvent(event: EventData) {
  createdEvents = [event, ...createdEvents];
}

export function getCreatedEvents(): EventData[] {
  return [...createdEvents];
}
