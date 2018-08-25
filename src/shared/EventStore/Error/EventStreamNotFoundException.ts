import { Identity } from '../../Identity';

export class EventStreamNotFoundException extends Error {
    static streamNotFound(id: Identity) {
        return new this(`EventStream not found for aggregate with id ${id.toString()}`);
    }
}
