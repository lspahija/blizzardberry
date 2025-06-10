type DomainEvent<T = any> = {
  id: number;
  type: string;
  user_id: string;
  event_data: T;
};
