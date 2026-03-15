export type EventData = {
  id: string;
  name: string;
  location: string;
  date: string;
  image: string;
};

let savedEvents: EventData[] = [];

export function addSavedEvent(event: EventData) {
  if (!savedEvents.find(e => e.id === event.id)) {
    savedEvents = [event, ...savedEvents];
  }
}

export function removeSavedEvent(id: string) {
  savedEvents = savedEvents.filter(e => e.id !== id);
}

export function isEventSaved(id: string): boolean {
  return savedEvents.some(e => e.id === id);
}

export function getSavedEvents(): EventData[] {
  return [...savedEvents];
}
