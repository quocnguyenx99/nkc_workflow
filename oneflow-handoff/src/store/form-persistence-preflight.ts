import { migrateStoredFormV3 } from './form-persistence';

// This module must be imported before App so the untouched v2 envelope is
// recoverable even when hydration immediately persists the migrated v3 state.
if (typeof window !== 'undefined') migrateStoredFormV3(window.localStorage);
