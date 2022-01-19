import {
  Outlet,
  useNavigate,
  Navigate,
  useLocation,
} from 'react-router-dom';

export function useNavigation() {
  const navigate = useNavigate(),
    navigateTo = (page) => {
      navigate(`/${page.path}`);
    },
    pathname = useLocation().pathname;

  return {
    Outlet,
    Navigate,
    navigate,
    navigateTo,
    useLocation,
    pathname,
  };
}
