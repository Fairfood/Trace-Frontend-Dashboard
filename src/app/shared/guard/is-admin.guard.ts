export const adminGuard = () => {
  const user = JSON.parse(localStorage.getItem('userData'));
  if (user.email_verified) {
    localStorage.setItem('isAdmin', 'true');
    return true;
  }
  return false;
};
