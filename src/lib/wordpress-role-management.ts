// Deprecated WordPress role management - will be removed
// This is a placeholder to fix build errors

export function getUserRoles() {
  console.warn('WordPress role management is deprecated');
  return [];
}

export function hasRole(role: string) {
  console.warn('WordPress role management is deprecated');
  return false;
}

export function checkPermission(permission: string) {
  console.warn('WordPress role management is deprecated');
  return false;
}