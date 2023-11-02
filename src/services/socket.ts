import { Manager } from 'socket.io-client';

const manager = new Manager('http://localhost:3004');
const socket = manager.socket('/admin');

manager.open();
socket.connect();

export { socket };
