import type { AppData } from "./models";
import type {
  Course,
  Fulfilment,
  GolfSession,
  InventoryRecord,
  KitchenTicket,
  MemberAccount,
  NotificationRecord,
  Order,
  Product,
  RestaurantRequest,
  Settings,
  StaffProfile,
} from "./models";
import { store } from "./store";

export class LocalRepository<T extends { id: string }> {
  constructor(
    private getAll: (d: AppData) => T[],
    private setAll: (d: AppData, v: T[]) => void,
  ) {}

  async list(): Promise<T[]> {
    return this.getAll(await store.load());
  }

  async getById(id: string): Promise<T | undefined> {
    return (await this.list()).find((x) => x.id === id);
  }

  async save(value: T): Promise<void> {
    const d = await store.load();
    const all = this.getAll(d);
    const idx = all.findIndex((x) => x.id === value.id);
    if (idx >= 0) all[idx] = value;
    else all.push(value);
    this.setAll(d, all);
    await store.save(d);
  }

  async delete(id: string): Promise<void> {
    const d = await store.load();
    this.setAll(
      d,
      this.getAll(d).filter((x) => x.id !== id),
    );
    await store.save(d);
  }
}

export const repositories = {
  course: new LocalRepository<Course>(
    (d) => d.courses,
    (d, v) => {
      d.courses = v;
    },
  ),
  catalog: new LocalRepository<Product>(
    (d) => d.products,
    (d, v) => {
      d.products = v;
    },
  ),
  menu: new LocalRepository<Product>(
    (d) => d.products,
    (d, v) => {
      d.products = v;
    },
  ),
  inventory: new LocalRepository<InventoryRecord>(
    (d) => d.inventory,
    (d, v) => {
      d.inventory = v;
    },
  ),
  golfSession: new LocalRepository<GolfSession>(
    (d) => d.sessions,
    (d, v) => {
      d.sessions = v;
    },
  ),
  order: new LocalRepository<Order>(
    (d) => d.orders,
    (d, v) => {
      d.orders = v;
    },
  ),
  fulfilment: new LocalRepository<Fulfilment>(
    (d) => d.fulfilments,
    (d, v) => {
      d.fulfilments = v;
    },
  ),
  staff: new LocalRepository<StaffProfile>(
    (d) => d.staff,
    (d, v) => {
      d.staff = v;
    },
  ),
  kitchen: new LocalRepository<KitchenTicket>(
    (d) => d.kitchenTickets,
    (d, v) => {
      d.kitchenTickets = v;
    },
  ),
  restaurant: new LocalRepository<RestaurantRequest>(
    (d) => d.restaurantRequests,
    (d, v) => {
      d.restaurantRequests = v;
    },
  ),
  member: new LocalRepository<MemberAccount>(
    (d) => d.members,
    (d, v) => {
      d.members = v;
    },
  ),
  minimumSpend: new LocalRepository<MemberAccount>(
    (d) => d.members,
    (d, v) => {
      d.members = v;
    },
  ),
  notification: new LocalRepository<NotificationRecord>(
    (d) => d.notifications,
    (d, v) => {
      d.notifications = v;
    },
  ),
  settings: {
    async get(): Promise<Settings> {
      return (await store.load()).settings;
    },
    async save(settings: Settings): Promise<void> {
      const d = await store.load();
      d.settings = settings;
      await store.save(d);
    },
  },
};

export { store, subscribeSync, generateId, nowIso } from "./store";
export { createSeedData, identities, SCHEMA_VERSION } from "./seed";
