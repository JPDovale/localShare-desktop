import { createRoot } from 'react-dom/client';
import App from './App';
import 'socket.io-client';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
