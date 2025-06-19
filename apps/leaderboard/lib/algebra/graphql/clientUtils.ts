import { ApolloClient } from '@apollo/client';

/**
 * 工具函数，用于将接受Apollo客户端的函数转换为可在React组件外部调用的函数
 * 这种模式避免了在非React组件环境中直接调用React Hooks
 *
 * @param fn 需要Apollo客户端的函数
 * @param client Apollo客户端实例
 * @returns 一个新函数，可以使用与原始函数相同的其他参数
 */
export function withClient<
  T extends (client: ApolloClient<any>, ...args: any[]) => any
>(
  fn: T,
  client: ApolloClient<any>
): (...args: Omit<Parameters<T>, 0>) => ReturnType<T> {
  return (...args: any[]) => {
    return fn(client, ...args);
  };
}

/**
 * 创建自定义Hook的辅助函数，用于将GraphQL操作封装到React Hook中
 *
 * @param useClientHook 获取Apollo客户端的Hook函数（如useSubgraphClient）
 * @param operations 使用Apollo客户端的函数对象
 * @returns 一个对象，包含封装后的函数，可以在React组件中安全使用
 *
 * 使用示例:
 *
 * ```
 * // 在clients/someData.ts中:
 * export async function fetchData(client, ...args) {
 *   // GraphQL查询逻辑
 * }
 *
 * export const useSomeData = createClientHook(
 *   useSubgraphClient,
 *   { fetchData }
 * );
 *
 * // 然后在React组件中:
 * function MyComponent() {
 *   const { fetchData } = useSomeData();
 *
 *   useEffect(() => {
 *     fetchData(...args).then(data => {
 *       // 处理数据
 *     });
 *   }, []);
 * }
 * ```
 */
export function createClientHook<
  T extends Record<string, (client: ApolloClient<any>, ...args: any[]) => any>
>(
  useClientHook: () => ApolloClient<any>,
  operations: T
): () => {
  [K in keyof T]: (...args: Omit<Parameters<T[K]>, 0>) => ReturnType<T[K]>;
} {
  return () => {
    const client = useClientHook();

    return Object.keys(operations).reduce((acc, key) => {
      acc[key] = (...args: any[]) => operations[key](client, ...args);
      return acc;
    }, {} as any);
  };
}
