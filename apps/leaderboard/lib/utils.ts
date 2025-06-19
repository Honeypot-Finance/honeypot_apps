import BigNumber from "bignumber.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function toCompactLocaleString(
  value: number | string | BigNumber,
  options?: Intl.NumberFormatOptions
) {
  if (!!!value) return "0";
  return Number(value) >= 0.01
    ? Number(value).toLocaleString("en-US", {
        // add suffixes for thousands, millions, and billions
        // the maximum number of decimal places to use
        maximumFractionDigits: 2,
        // specify the abbreviations to use for the suffixes
        notation: "compact",
        compactDisplay: "short",
        ...options,
      })
    : "< 0.01";
}

export function shortenString(str: string, chars = 4): string {
  if (!str) return "";
  return `${str.substring(0, chars)}...${str.substring(str.length - chars)}`;
}

export const shortenAddressString = (address: string, chars = 4): string => {
  if (!address) return "";

  return `${address.substring(0, chars + 2)}...${address.substring(
    address.length - chars
  )}`;
};

export const formatVolume = (volume: number): string => {
  const value = volume;

  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }

  return `$${value.toFixed(2)}`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isNotNull = (value: any): boolean => {
  return value !== null && value !== undefined;
};

export function hasValue(obj: any): boolean {
  if (typeof obj !== "object" || obj === null) return false;
  for (let key in obj) {
    const value = obj[key];
    if (typeof value !== "object" && isNotNull(value) && Boolean(value))
      return true;

    if (Array.isArray(value)) {
      if (value.some(hasValue)) return true;
    }

    if (typeof value === "object" && value !== null) {
      if (hasValue(value)) return true;
    }
  }

  return false;
}
type FilterObject = {
  [key: string]: any;
};

export function removeEmptyFields(obj: FilterObject): FilterObject {
  const cleanedObject: FilterObject = {};

  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        const nestedObject = removeEmptyFields(obj[key]);
        if (Object.keys(nestedObject).length > 0) {
          cleanedObject[key] = nestedObject;
        }
      } else if (obj[key] !== "") {
        cleanedObject[key] = obj[key];
      }
    }
  }

  console.log("cleanedObject", cleanedObject);

  return cleanedObject;
}

export function getTextSizeClass(text: string | undefined | null): string {
  if (!text)
    return "text-2xl md:text-[34px] text-stroke-2 text-shadow-[2px_4px_0px_#AF7F3D]";

  if (text.length > 10)
    return "text-base md:text-xl text-stroke-1 text-shadow-[1px_2px_0px_#AF7F3D]";
  if (text.length > 5)
    return "text-xl md:text-2xl text-stroke-[1.5px] text-shadow-[1.5px_3px_0px_#AF7F3D]";
  return "text-2xl md:text-[34px] text-stroke-2 text-shadow-[2px_4px_0px_#AF7F3D]";
}

export const formatNumberWithUnit = (num: number, decimals = 2): string => {
  const minValue = Math.pow(10, -decimals); // Calculate minimum value based on decimals
  if (num > 0 && num < minValue) {
    return `<${minValue}`;
  }

  const units = ['', 'k', 'M', 'B', 'T'];
  let unitIndex = 0;
  let value = num;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }

  // 使用 Number 将结果转换为数字以去除末尾的 0，然后限制最大小数位数
  return `${Number(value.toFixed(decimals))}${units[unitIndex]}`;
};