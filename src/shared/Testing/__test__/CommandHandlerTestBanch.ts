import { Identity } from '../../Identity';

class UserId extends Identity {

}

class AssociationId extends Identity {

}

class MemberId extends Identity {

}

describe('AddCommentToMemberCommandHandler', () => {
    const userId = new UserId('user-id-213');
    const associationId = new AssociationId('8de582a1-b5d8-4a43-b517-696f1ba39869');
    const memberId = new MemberId('member-id-2134');
    let scenario: CommandHandlerTestBanch;

    beforeEach(async () => {
        const testBench = TestBench.create();
        scenario = testBench.scenario<Association, AssociationRepository>();
        await scenario
            .withRepository((eventStore, eventBus, logger) => {
                return new AssociationRepository(eventStore, eventBus, logger, new AggregateEventStreamDecorator([]));
            })
            .withCommandHandlers([
                (repository) => {
                    return new AddCommentToMemberCommandHandler(repository);
                },
            ])
            .withId(associationId);

        await scenario.given([
            new AssociationCreatedEvent('Misalsa', userId),
            new MemberAddedEvent(memberId, 'Jan', 'person.png', '', ''),
        ]);
    });

    it('An user should be able to add a comment to a member', async () => {
        await scenario.when([(new AddCommentToMemberCommand(memberId, associationId, 'lala')).invokedBy(userId)]);
        scenario.thenMatchNewEvents([new MemberCommentAddedEvent(memberId, userId, 'lala')]);
    });

    it('An unauthorized user should not be able to add a comment to a member',  async () => {
        const otherUserId = new UserId('user-id-234234');
        try {
            await scenario.when([(new AddCommentToMemberCommand(memberId, associationId, 'lala')).invokedBy(otherUserId)]);
        } catch (e) {
            expect(e.message).toBe('User has no permission to add to a comment');
        }
    });

});
