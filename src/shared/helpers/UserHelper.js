export const UserHelper = {
  getUserRoleText: (status) => {
    switch (status) {
      case 'ADMIN':
        return 'Admin';
      case 'OPERATOR':
        return 'Operator';
      case 'USER':
        return 'User';
      case 'GUEST':
        return 'Guest';

      default:
        return '';
    }
  },
  getUserRoleColor: (status) => {
    switch (status) {
      case 'ADMIN':
        return 'info';
      case 'GUEST':
        return 'secondary';
      case 'USER':
        return 'success';
      case 'OPERATOR':
        return 'warning text-dark';

      default:
        return '';
    }
  },
};
