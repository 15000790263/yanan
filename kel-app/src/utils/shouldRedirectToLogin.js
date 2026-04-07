import dayjs from 'dayjs';
export function shouldRedirectToLogin() {
  const lastVisitDate = localStorage.getItem('lastVisitDate');
  const currentDate = dayjs().format('YYYY-MM-DD');

  if (!lastVisitDate || lastVisitDate !== currentDate) {
    localStorage.setItem('lastVisitDate', currentDate);
    return true;
  }
  return false;
}
