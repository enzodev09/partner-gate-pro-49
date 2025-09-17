import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : initialValue;
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(storedValue));
		} catch {
			// ignore
		}
	}, [key, storedValue]);

	return [storedValue, setStoredValue] as const;
}

export function getLocalStorage<T>(key: string, fallback: T): T {
	try {
		const v = window.localStorage.getItem(key);
		return v ? (JSON.parse(v) as T) : fallback;
	} catch {
		return fallback;
	}
}

export function setLocalStorage<T>(key: string, value: T) {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// ignore
	}
}
