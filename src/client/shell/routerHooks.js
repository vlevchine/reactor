import { useNavigate } from 'react-router-dom';
// toasterService.show({
//   message: `Error logging in: ${err}`,
//   intent: 'error',
// });
export const useError = () => {
  const navigate = useNavigate(),
    onError = (err, txt = '', uri = '/') => {
      if (err) {
        const msg = {
          code: err.code,
          message: `${txt}: ${err.message}`,
        };
        navigate('/error', {
          state: { err: msg, uri },
        });
      }
    };

  // useEffect(() => {
  //   const sub = store.subscribe(ERR, onError);
  //   return () => store.unsubscribe(sub, ERR);
  // }, []);

  return onError;
};
