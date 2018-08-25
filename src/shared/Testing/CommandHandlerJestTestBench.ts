import { SimpleCommandBus, CommandBus, CommandHandler } from '../CommandHandling';
import { DomainEvent, DomainMessage } from '../Domain';
import { Identity } from '../Identity';

export class CommandHandlerJestTestBench {

    public readonly playheadmap: { [id: string]: number } = {};

    public static createDefault() {
        const date = new Date();
        date.setTime(1535183762);
        return new this(new SimpleCommandBus(), date);
    }

    constructor(public commandBus: CommandBus, public currentTime: Date) {

    }

    public createCommandHandler(createHandler: (testBench: CommandHandlerJestTestBench) => CommandHandler) {
        const handler = createHandler(this);
        this.commandBus.subscribe(handler);
    }

    public given(id: Identity, ...events: DomainEvent[]): this {
        const domainMessaged = this.createDomainMessages(id, events);
        this.commandBus.dispatch()
        return this;
    }

    private createDomainMessages(id: Identity, ...events: DomainEvent[]): DomainMessage[] {
        return events.map((event) => {
            return this.createDomainMessage(id, event);
        });
    }

    private createDomainMessage(id: Identity, event: DomainEvent) {
        const playhead = this.getIncreasedPlayheadForIdentity(id);
        return new DomainMessage(id, playhead, event, this.currentTime);
    }

    private getIncreasedPlayheadForIdentity(id: Identity): number {
        const key = id.toString();
        if (!this.playheadmap[key]) {
            this.playheadmap[key] = 0;
        } else {
            this.playheadmap[key] += 1;
        }
        return this.playheadmap[key];
    }
}
