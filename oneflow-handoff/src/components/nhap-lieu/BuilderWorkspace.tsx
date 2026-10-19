import { useMemo } from 'react';
import { isV6BuilderEnabled } from '@/store/form-persistence';
import { BuilderWorkspaceLegacy } from './BuilderWorkspaceLegacy';
import { BuilderWorkspaceV6, type BuilderWorkspaceV6Props } from './BuilderWorkspaceV6';

export function BuilderWorkspace(props: BuilderWorkspaceV6Props) {
  const enabled = useMemo(() => isV6BuilderEnabled(typeof window === 'undefined' ? undefined : window.localStorage), []);
  return enabled ? <BuilderWorkspaceV6 {...props} /> : <BuilderWorkspaceLegacy {...props} />;
}
