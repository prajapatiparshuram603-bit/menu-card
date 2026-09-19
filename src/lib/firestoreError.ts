import { auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface SecurityRuleContext {
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write' | string;
  path?: string;
}

export function handleFirestoreError(
  error: unknown,
  operationTypeOrContext: OperationType | string | SecurityRuleContext,
  path: string | null = null
): never {
  const isContextObj = typeof operationTypeOrContext === 'object' && operationTypeOrContext !== null && 'operation' in operationTypeOrContext;

  const op = isContextObj
    ? (operationTypeOrContext as SecurityRuleContext).operation
    : (operationTypeOrContext as OperationType | string);

  const resolvedPath = isContextObj
    ? (operationTypeOrContext as SecurityRuleContext).path ?? null
    : path;

  const normalizedOp = (typeof op === 'string' ? op.toLowerCase() : op) as OperationType;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType: normalizedOp,
    path: resolvedPath,
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
