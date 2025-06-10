type Handler<T = any> = (evt: DomainEvent<T>) => Promise<void>;

export const handlers: Record<string, Handler | undefined> = {
  CREDIT_ADDED: async (e) => {
    console.log('Credit added');
  },
  // add more event handlers here
};
