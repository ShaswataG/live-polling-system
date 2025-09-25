// frontend/src/lib/socket.ts
import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
	if (!socket) {
		const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
		socket = io(url, { transports: ['websocket'], autoConnect: true });
	}
	return socket;
}

export function ensureSocketConnected(cb?: (s: Socket) => void) {
	const s = getSocket();
	if (s.connected) cb?.(s);
	else s.on('connect', () => cb?.(s));
}

export function disconnectSocket() {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}