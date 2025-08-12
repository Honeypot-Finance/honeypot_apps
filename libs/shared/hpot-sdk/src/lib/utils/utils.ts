import { ToastOptions, toast } from 'react-toastify';
import { wallet } from '../wallet/wallet';
import { TransactionPendingToastify } from '../../components/CustomToastify/TransactionPendingToastify/TransactionPendingToastify';
import { localforage } from '../utils/storage';
import { LRUCache } from 'lru-cache';
import { debounce, max, initial } from 'lodash';
import { PageRequest } from '../../types/pagination';
import { visualEffects } from '../visualeffect/visualeffects';
import { WrappedToastify } from '../utils/wrappedToastify';
import { makeAutoObservable } from 'mobx';
import { TransactionReceipt } from 'viem';

export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
};

export async function fallbacks<T>(
  args: (() => T)[] | (() => Promise<T>)[]
): Promise<T | undefined> {
  for (let i = 0; i < args.length; i++) {
    try {
      return await args[i]();
    } catch (error) {
      continue;
    }
  }
  return undefined;
}

export class ValueState<T> {
  _value!: T;
  constructor(args: Partial<ValueState<T>> = {}) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get value() {
    return this.getValue ? this.getValue(this._value) : this._value;
  }
  set value(value) {
    this._value = value;
  }

  getValue!: (value: T) => T;

  setValue(value: T) {
    this._value = value;
  }
}
export class AsyncState<
  K extends (...args: any) => Promise<any> = (...args: any) => Promise<any>,
  T = Awaited<ReturnType<K>>
> {
  initialValue: T | null = null;
  isInit = false;
  loading = false;
  error: Error | null = null;
  value: T | null = null;
  cache?: LRUCache<string, any>;
  private _call: K;
  constructor(
    func: K,
    options?: {
      initialValue?: T;
      loading?: boolean;
      cache: LRUCache.Options<string, any, any> | boolean;
    }
  ) {
    this._call = func;
    if (options) {
      const { cache, initialValue, ...restOptions } = options;
      if (initialValue !== undefined) {
        this.initialValue = initialValue;
        this.value = initialValue;
      }
      this.handleCacheConfig(cache);
      Object.assign(this, restOptions);
    }

    makeAutoObservable(this);
  }

  handleCacheConfig(cache: LRUCache.Options<string, any, any> | boolean) {
    const defaultCacheOptions = {
      allowStale: false,
      ttl: 1000 * 5,
      max: 100,
    };
    if (cache) {
      this.cache = new LRUCache({
        ...defaultCacheOptions,
        ...(cache === true ? {} : cache),
      });
    }
  }

  async call(...args: Parameters<K>) {
    const cachedValue = this.cache?.get(JSON.stringify(args));
    if (cachedValue) {
      this.setValue(cachedValue);
      return [this.value, null] as [T, Error | null];
    }
    this.setLoading(true);
    this.value = null;
    try {
      const data = await this._call(...args);
      this.setValue(data);
      this.cache?.set(JSON.stringify(args), data);
    } catch (error) {
      console.error(error);
      this.setError(error as Error);
    }
    this.setLoading(false);
    if (!this.isInit) {
      this.isInit = true;
    }
    return [this.value, this.error] as [T, Error | null];
  }
  setLoading(loading: boolean) {
    this.loading = loading;
  }
  setError(error: Error | null) {
    this.error = error;
  }
  setValue(data: T | null) {
    this.value = data;
  }
  reset() {
    this.value = this.initialValue;
    this.error = null;
  }
}

export class ContractWrite<T extends (...args: any) => any> {
  static nonce = 0;
  loading = false;
  error: Error | null = null;
  action?: string = '';
  successMsg: string = '';
  failMsg: string = '';
  silent: boolean = false;
  isSuccessEffect: boolean = false;
  successCallBack: (transaction: TransactionReceipt) => any = () => {};
  private _call: (...args: any) => any;
  constructor(func: T, options?: Partial<ContractWrite<T>>) {
    this._call = func;
    if (options) {
      Object.assign(this, options);
    }

    makeAutoObservable(this);
  }

  get successMsgAgg() {
    if (this.successMsg) {
      return this.successMsg;
    }
    return this.action ? `${this.action} successfully` : `Transaction Success`;
  }

  get failMsgAgg() {
    if (this.failMsg) {
      return this.failMsg;
    }
    return this.action ? `${this.action} Failed` : `Transaction Failed`;
  }

  async call(args: Parameters<T>[0] = [], options?: Partial<Parameters<T>[1]>) {
    this.setLoading(true);
    try {
      const hash = await this._call(args, {
        account: wallet.account,
        ...options,
      });
      console.log('hash', hash);
      const pendingPopup = WrappedToastify.pending({
        message: TransactionPendingToastify({ hash, action: this.action }),
        title: this.action,
        options: {
          autoClose: false,
          isLoading: true,
        } as ToastOptions,
      });
      console.log('pendingPopup', pendingPopup);
      const transaction = await wallet.publicClient.waitForTransactionReceipt({
        confirmations: 2,
        hash,
        pollingInterval: 5000,
        timeout: 1000 * 60 * 15, // 15 minutes timeout for less Gas Price: as like OKX estimates very tiny gas Price 
      });
      console.log('transaction', transaction);
      toast.dismiss(pendingPopup);
      if (!this.silent) {
        switch (transaction.status) {
          case 'success':
            WrappedToastify.success({
              message: this.successMsgAgg,
              title: this.action,
            });
            if (this.isSuccessEffect) {
              visualEffects.startConfetti();
            }
            break;
          case 'reverted':
            WrappedToastify.error({
              message: this.failMsgAgg,
              title: this.action,
            });
            break;
          default:
            throw new Error(`Transaction ${hash} Pending`);
        }
      }

      if (this.successCallBack) {
        this.successCallBack(transaction);
      }
      return transaction;
    } catch (error: any) {
      if (error.message.includes('User rejected the request')) {
        WrappedToastify.error({ message: 'User rejected the request' });
      } else {
        WrappedToastify.error({ message: this.failMsg || error.message });
      }

      console.error(error);
      this.setError(error as Error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
  async callV2(p0: [string], ...args: Parameters<T>) {
    this.setLoading(true);
    try {
      const hash = await this._call(...args);
      console.log('hash', hash);
      const pendingPopup = WrappedToastify.pending({
        message: TransactionPendingToastify({ hash, action: this.action }),
        title: this.action,
        options: {
          autoClose: false,
          isLoading: true,
        } as ToastOptions,
      });
      const transaction = await wallet.publicClient.waitForTransactionReceipt({
        confirmations: 2,
        hash,
        pollingInterval: 5000,
        timeout: undefined,
      });
      console.log('transaction', transaction);
      toast.dismiss(pendingPopup);
      if (!this.silent) {
        switch (transaction.status) {
          case 'success':
            WrappedToastify.success({
              message: this.successMsgAgg,
              title: this.action,
            });
            break;
          case 'reverted':
            WrappedToastify.error({
              message: this.failMsgAgg,
              title: this.action,
            });
            break;
          default:
            throw new Error(`Transaction ${hash} Pending`);
        }
      }

      if (this.successCallBack) {
        this.successCallBack(transaction);
      }
      return transaction;
    } catch (error: any) {
      if (error.message.includes('User rejected the request')) {
        WrappedToastify.error({ message: 'User rejected the request' });
      } else {
        WrappedToastify.error({ message: this.failMsg || error.message });
      }

      console.error(error);
      this.setError(error as Error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
  setLoading(loading: boolean) {
    this.loading = loading;
  }
  setError(error: Error | null) {
    this.error = error;
  }
}

export class PaginationState {
  page: number = 1;
  limit: number = 10;
  total: number = 0;

  constructor(args: Partial<PaginationState>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get offset() {
    return (this.page - 1) * this.limit;
  }

  get end() {
    return this.page * this.limit;
  }

  get totalPage() {
    return Math.ceil(this.total / this.limit);
  }
  setData(args: Partial<PaginationState>) {
    Object.assign(this, args);
  }

  onPageChange = (page: number) => {
    this.page = page;
  };
  onSizeChange = (limit: number) => {
    this.limit = limit;
  };
  setTotal(total: number) {
    this.total = total;
  }
}

export class PaginationDataState<T> {
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  data = {} as Record<number, T[]>;

  get pageData() {
    return this.data[this.page];
  }

  constructor(args: Partial<PaginationState>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get offset() {
    return (this.page - 1) * this.limit;
  }

  get end() {
    return this.page * this.limit;
  }

  get totalPage() {
    return Math.ceil(this.total / this.limit);
  }
  fetch!: AsyncState<() => Promise<T[]>>;

  setData(args: Partial<PaginationState>) {
    Object.assign(this, args);
  }

  onPageChange = async (page: number) => {
    this.page = page;
    const [value, error] = await this.fetch.call();
    if (!error) {
      this.data[page] = value;
    }
  };
  onSizeChange = (limit: number) => {
    this.limit = limit;
  };
  setTotal(total: number) {
    this.total = total;
  }
}

/**
 * @deprecated The method should not be used
 *
 * use `IndexerPaginationState` instead
 */
export class OldIndexerPaginationState<
  FilterT extends Record<string, any> = {},
  ItemT extends any = any
> {
  namespace: string = '';
  pageInfo: PageInfo = {
    hasNextPage: true,
    hasPreviousPage: false,
    startCursor: '',
    endCursor: '',
  };
  filter: FilterT = {} as FilterT;
  isInit: boolean = false;
  isLoading: boolean = false;
  pageItems = new ValueState<ItemT[]>({
    value: [],
  });
  LoadNextPageFunction: (
    filter: FilterT,
    pageRequest: PageRequest
  ) => Promise<{ items: ItemT[]; pageInfo: PageInfo }> = async () =>
    Promise.resolve({ items: [], pageInfo: this.pageInfo });

  constructor(args: Partial<OldIndexerPaginationState<FilterT, ItemT>>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  updateFilter = debounce((filter: Partial<FilterT>) => {
    this.filter = {
      ...this.filter,
      ...filter,
    };
    this.reloadPage();
  }, 500);

  resetPage = () => {
    this.pageInfo = {
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: '',
      endCursor: '',
    };
    this.isInit = false;
    this.pageItems.setValue([]);
  };

  reloadPage = async () => {
    if (this.isLoading) return;
    this.isInit = false;
    this.resetPage();
    await this.loadMore();
    this.isInit = true;
  };

  loadMore = async () => {
    if (this.isLoading || !this.pageInfo.hasNextPage) {
      return;
    }

    this.isLoading = true;

    try {
      const { items, pageInfo } = await this.LoadNextPageFunction(this.filter, {
        direction: 'next',
        cursor: this.pageInfo.endCursor,
      });

      this.SetPageItems([...this.pageItems.value, ...items]);
      this.pageInfo = pageInfo;
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  };

  SetPageItems = (items: ItemT[]) => {
    this.pageItems.setValue(items);
  };

  addPageItemsAtEnd = (items: ItemT[]) => {
    this.pageItems.setValue([...this.pageItems.value, ...items]);
  };

  addPageItemsToStart = (items: ItemT[]) => {
    this.pageItems.setValue([...items, ...this.pageItems.value]);
  };

  addSingleItemToStart = (item: ItemT) => {
    this.pageItems.setValue([item, ...this.pageItems.value]);
  };

  addSingleItemToEnd = (item: ItemT) => {
    this.pageItems.setValue([...this.pageItems.value, item]);
  };

  removeItem = (item: ItemT) => {
    this.pageItems.setValue(this.pageItems.value.filter((i) => i !== item));
  };

  setIsInit(isInit: boolean) {
    this.isInit = isInit;
  }

  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }
}

export class IndexerPaginationState<
  FilterT extends Record<string, any & { hasNextPage: boolean }> = {},
  ItemT extends any = any
> {
  namespace: string = '';
  filter: FilterT = {} as FilterT;
  defaultFilter: FilterT = {} as FilterT;
  isInit: boolean = false;
  isLoading: boolean = false;
  pageItems = new ValueState<ItemT[]>({
    value: [],
  });
  LoadNextPageFunction: (
    filter: FilterT
  ) => Promise<{ items: ItemT[]; filterUpdates?: Partial<FilterT> }> =
    async () => Promise.resolve({ items: [] });

  constructor(args: Partial<IndexerPaginationState<FilterT, ItemT>>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  updateFilter = debounce((filter: Partial<FilterT>) => {
    this.filter = {
      ...this.filter,
      ...filter,
    };
    console.log('this.filter', this.filter);
    this.reloadPage();
  }, 500);

  resetPage = () => {
    this.filter = { ...this.defaultFilter, ...this.filter };
    console.log('resetPage', this.filter);
    this.isInit = false;
    this.pageItems.setValue([]);
  };

  reloadPage = async () => {
    if (this.isLoading) return;
    this.isInit = false;
    this.resetPage();
    await this.loadMore();
    this.isInit = true;
  };

  loadMore = async () => {
    if (this.isLoading || !this.filter['hasNextPage']) {
      return;
    }

    this.isLoading = true;

    try {
      const { items, filterUpdates: newFilter } =
        await this.LoadNextPageFunction(this.filter);

      console.log('items,newFilter', items, newFilter);

      if (newFilter) {
        this.filter = {
          ...this.filter,
          ...newFilter,
        };
      }

      this.SetPageItems([...this.pageItems.value, ...items]);
    } catch (error) {
      console.log('error', error);
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  };

  SetPageItems = (items: ItemT[]) => {
    this.pageItems.setValue(items);
  };

  addPageItemsAtEnd = (items: ItemT[]) => {
    this.pageItems.setValue([...this.pageItems.value, ...items]);
  };

  addPageItemsToStart = (items: ItemT[]) => {
    this.pageItems.setValue([...items, ...this.pageItems.value]);
  };

  addSingleItemToStart = (item: ItemT) => {
    this.pageItems.setValue([item, ...this.pageItems.value]);
  };

  addSingleItemToEnd = (item: ItemT) => {
    this.pageItems.setValue([...this.pageItems.value, item]);
  };

  removeItem = (item: ItemT) => {
    this.pageItems.setValue(this.pageItems.value.filter((i) => i !== item));
  };

  setIsInit(isInit: boolean) {
    this.isInit = isInit;
  }

  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }
}

export class StorageState<T = any, U = any> {
  static storages = {} as Record<string, StorageState>;
  static register(key: string, storage: StorageState) {
    StorageState.storages[key] = storage;
  }
  static async sync() {
    return Promise.all(
      Object.values(StorageState.storages).map(async (storage) => {
        return storage.syncValue();
      })
    );
  }
  key: string = '';
  value: T | null = null;
  isInit = false;
  transform?: (args?: any) => T | null;
  serialize?: (value: T | null) => U;
  deserialize?: (value: U) => T | null;
  constructor({
    ...args
  }: Pick<StorageState<T>, 'key' | 'value' | 'deserialize' | 'serialize'> & {
    transform?: (args?: any) => T | null;
  }) {
    Object.assign(this, args);
    StorageState.register(this.key, this);
    makeAutoObservable(this);
  }

  async transformAndSetValue(value: any) {
    await this.setValue(this.transform ? this.transform(value) : value);
  }

  async setValue(value: T | null) {
    this.value = value;
    await localforage.setItem(
      this.key,
      this.serialize ? this.serialize(this.value) : this.value
    );
  }

  async syncValue() {
    if (!this.isInit) {
      const storedValue = await localforage.getItem(this.key);
      if (storedValue) {
        this.value = this.deserialize
          ? this.deserialize(storedValue as any)
          : (storedValue as T);
      }
      this.isInit = true;
    }
  }
}

export abstract class BaseState {
  isInit = false;
  isInitLoading = false;
  refreshLoading = false;
  constructor() {
    makeAutoObservable(this);
  }
  refresh() {}
  init() {
    this.isInit = true;
  }
}
