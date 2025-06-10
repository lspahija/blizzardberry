type DomainEvent<T = any> = {
  id: number;
  type: string;
  user_id: number;
  event_data: T;
};
