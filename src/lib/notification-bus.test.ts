import { notificationBus } from "@/lib/notification-bus";
import { makeNotificationPayload } from "@/test/factories";

describe("notificationBus", () => {
    it("delivers a payload only to the addressed user", () => {
        const mine = jest.fn();
        const theirs = jest.fn();
        const offMine = notificationBus.subscribe("bus-a", mine);
        const offTheirs = notificationBus.subscribe("bus-b", theirs);

        const payload = makeNotificationPayload();
        notificationBus.publish("bus-a", payload);

        expect(mine).toHaveBeenCalledWith(payload);
        expect(theirs).not.toHaveBeenCalled();
        offMine();
        offTheirs();
    });

    it("fans out to several listeners and counts them", () => {
        const one = jest.fn();
        const two = jest.fn();
        const offOne = notificationBus.subscribe("bus-c", one);
        const offTwo = notificationBus.subscribe("bus-c", two);
        expect(notificationBus.subscriberCount("bus-c")).toBe(2);

        notificationBus.publish("bus-c", makeNotificationPayload());
        expect(one).toHaveBeenCalledTimes(1);
        expect(two).toHaveBeenCalledTimes(1);

        offOne();
        expect(notificationBus.subscriberCount("bus-c")).toBe(1);
        offTwo();
        expect(notificationBus.subscriberCount("bus-c")).toBe(0);
    });

    it("stops delivering after unsubscribe and tolerates repeats", () => {
        const listener = jest.fn();
        const off = notificationBus.subscribe("bus-d", listener);
        off();
        off();

        notificationBus.publish("bus-d", makeNotificationPayload());
        expect(listener).not.toHaveBeenCalled();
    });

    it("publishing to nobody is a no-op", () => {
        expect(() =>
            notificationBus.publish("nobody", makeNotificationPayload()),
        ).not.toThrow();
    });

    it("isolates a throwing listener from the others", () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        const healthy = jest.fn();
        const offBad = notificationBus.subscribe("bus-e", () => {
            throw new Error("boom");
        });
        const offGood = notificationBus.subscribe("bus-e", healthy);

        notificationBus.publish("bus-e", makeNotificationPayload());

        expect(healthy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalled();
        offBad();
        offGood();
        spy.mockRestore();
    });
});
