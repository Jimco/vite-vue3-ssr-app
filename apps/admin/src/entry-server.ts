import { defineServerEntry } from '@zqd/naco/client/define-server-entry';
import { createApp } from './main';

export default defineServerEntry(createApp);
