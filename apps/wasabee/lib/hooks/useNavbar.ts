import { useState, useEffect, createElement } from 'react';
import { Menu } from '@/config/allAppPath';
import { ReactNode } from 'react';
import { StaticImageData } from 'next/image';

type SerializedReactElement = {
  type: string;
  key: string | null;
  ref: any;
  props: {
    style?: Record<string, any>;
    children?: any;
    [key: string]: any;
  };
  _owner: any;
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

// Convert absolute URL to relative path for current app
const convertToRelativePath = (url: string): string => {
  if (!url.startsWith('http')) return url;

  try {
    const urlObj = new URL(url);
    // If it's a wasabee URL, convert to relative path
    if (urlObj.hostname === 'dex.honeypotfinance.xyz') {
      return urlObj.pathname + urlObj.search + urlObj.hash;
    }
    // Otherwise keep the absolute URL
    return url;
  } catch {
    return url;
  }
};

// Recreate React element from serialized format
const recreateReactElement = (
  serialized: any,
  index?: number
): ReactNode | undefined => {
  if (!serialized || typeof serialized !== 'object') return undefined;
  if (!serialized.type || !serialized.props) return undefined;

  // Clone props and handle children recursively
  const props = { ...serialized.props };

  // Remove React internal properties
  delete props.key;
  delete props.ref;
  delete props._owner;
  delete props._store;

  // Add a stable key for React reconciliation
  if (index !== undefined) {
    props.key = `badge-${index}`;
  }

  // Recursively recreate children if they exist
  if (props.children) {
    if (Array.isArray(props.children)) {
      props.children = props.children.map((child: any, idx: number) =>
        typeof child === 'object' && child.type
          ? recreateReactElement(child, idx)
          : child
      );
    } else if (typeof props.children === 'object' && props.children.type) {
      props.children = recreateReactElement(props.children, 0);
    }
  }

  return createElement(serialized.type, props);
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

  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        setLoading(true);
        console.log('[useNavbar] Fetching navbar from API...');

        // Use fetch directly without Content-Type header to avoid CORS preflight
        const res = await fetch('https://honeypotfinance.xyz/api/navbar');

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const response: NavbarApiResponse = await res.json();
        console.log('[useNavbar] API response:', response);
        console.log(
          '[useNavbar] First menu item beforeElement:',
          response.menu[0]?.beforeElement
        );
        console.log(
          '[useNavbar] First menu item afterElement:',
          response.menu[0]?.afterElement
        );
        const mappedMenu = mapApiMenuToMenu(response.menu);
        console.log('[useNavbar] Mapped menu:', mappedMenu);
        console.log(
          '[useNavbar] First mapped item beforeContent:',
          mappedMenu[0]?.beforeContent
        );
        console.log(
          '[useNavbar] First mapped item afterContent:',
          mappedMenu[0]?.afterContent
        );
        setData(mappedMenu);
        setError(null);
      } catch (err) {
        console.error('[useNavbar] Error fetching navbar:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to fetch navbar data')
        );
        // Fallback to local config on error
        const { appPathsList } = await import('@/config/allAppPath');
        console.log('[useNavbar] Using fallback config:', appPathsList);
        setData(appPathsList);
      } finally {
        setLoading(false);
      }
    };

    fetchNavbar();
  }, []);

  return {
    menuList: data,
    loading,
    error,
  };
}
