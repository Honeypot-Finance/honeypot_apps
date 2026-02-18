import { useState, useEffect, createElement, useRef } from 'react';
import { Menu } from '@/config/allAppPath';
import { API_URLS } from '@/config/constants';
import { convertToRelativePath } from '@/lib/utils/url';
import { ReactNode } from 'react';
import { StaticImageData } from 'next/image';

type SerializedReactElement = {
  type: string;
  key: string | null;
  ref: unknown;
  props: {
    style?: Record<string, unknown>;
    children?: unknown;
    [key: string]: unknown;
  };
  _owner: unknown;
};

type ApiMenu = {
  path:
    | string
    | {
        path: string;
        title: string;
        routePath: string;
        icon?: StaticImageData;
        beforeElement?: ReactNode | SerializedReactElement;
        afterElement?: ReactNode | SerializedReactElement;
      }[];
  title: string;
  routePath?: string;
  icon?: StaticImageData;
  beforeElement?: ReactNode | SerializedReactElement;
  afterElement?: ReactNode | SerializedReactElement;
};

type NavbarApiResponse = {
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  menu: ApiMenu[];
};

// Check if a serialized element contains specific text content
const hasTextContent = (serialized: unknown, text: string): boolean => {
  if (!serialized || typeof serialized !== 'object') return false;
  const elem = serialized as SerializedReactElement;
  if (elem.props?.children === text) return true;
  if (Array.isArray(elem.props?.children)) {
    return elem.props.children.some((child: unknown) => child === text || hasTextContent(child, text));
  }
  if (typeof elem.props?.children === 'object') {
    return hasTextContent(elem.props.children, text);
  }
  return false;
};

// Recreate React element from serialized format
const recreateReactElement = (
  serialized: unknown,
  index?: number
): ReactNode | undefined => {
  if (!serialized || typeof serialized !== 'object') return undefined;

  const elem = serialized as SerializedReactElement;
  if (!elem.type || !elem.props) return undefined;

  // Filter out "Pre-TGE" badge elements
  if (hasTextContent(serialized, 'Pre-TGE')) return undefined;

  // Clone props and handle children recursively
  const props = { ...elem.props };

  // Remove React internal properties
  delete props.key;
  delete props.ref;
  delete (props as Record<string, unknown>)._owner;
  delete (props as Record<string, unknown>)._store;

  // Add a stable key for React reconciliation
  if (index !== undefined) {
    props.key = `badge-${index}`;
  }

  // Recursively recreate children if they exist
  if (props.children) {
    if (Array.isArray(props.children)) {
      props.children = props.children.map((child: unknown, idx: number) =>
        typeof child === 'object' && child !== null && 'type' in child
          ? recreateReactElement(child, idx)
          : child
      );
    } else if (typeof props.children === 'object' && props.children !== null && 'type' in props.children) {
      props.children = recreateReactElement(props.children, 0);
    }
  }

  return createElement(elem.type, props);
};

// Map API response to internal Menu format
const mapApiMenuToMenu = (apiMenu: ApiMenu[]): Menu[] => {
  return apiMenu.map((item, itemIndex) => {
    const baseItem = {
      title: item.title,
      routePath: item.routePath
        ? convertToRelativePath(item.routePath)
        : undefined,
      icon: item.icon,
      beforeContent: recreateReactElement(item.beforeElement, itemIndex),
      afterContent: recreateReactElement(item.afterElement, itemIndex + 1000),
    };

    if (Array.isArray(item.path)) {
      return {
        ...baseItem,
        path: item.path.map((subItem, subIndex) => ({
          path: convertToRelativePath(subItem.path),
          title: subItem.title,
          routePath: convertToRelativePath(subItem.routePath),
          icon: subItem.icon,
          beforeContent: recreateReactElement(
            subItem.beforeElement,
            itemIndex * 100 + subIndex
          ),
          afterContent: recreateReactElement(
            subItem.afterElement,
            itemIndex * 100 + subIndex + 50
          ),
        })),
      };
    }

    return {
      ...baseItem,
      path: convertToRelativePath(item.path as string),
    };
  });
};

export function useNavbar() {
  const [data, setData] = useState<Menu[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchNavbar = async () => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);

        const res = await fetch(API_URLS.NAVBAR, {
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const response: NavbarApiResponse = await res.json();
        const mappedMenu = mapApiMenuToMenu(response.menu);
        setData(mappedMenu);
        setError(null);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        if (process.env.NODE_ENV === 'development') {
          console.error('[useNavbar] Error fetching navbar:', err);
        }

        setError(
          err instanceof Error ? err : new Error('Failed to fetch navbar data')
        );

        // Fallback to local config on error
        const { appPathsList } = await import('@/config/allAppPath');
        setData(appPathsList);
      } finally {
        setLoading(false);
      }
    };

    fetchNavbar();

    // Cleanup: abort pending request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    menuList: data,
    loading,
    error,
  };
}
