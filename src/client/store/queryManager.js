import {
  useQuery,
  useLazyQuery,
  useMutation,
  useSubscription,
} from '@apollo/react-hooks';
//This wrapper over apollo/hooks will be exposed
// may change some time, but keeping client app hooks API the same
//Playground may override that to place in ctx, so that fake queries would be used
export default {
  useQuery,
  useLazyQuery,
  useMutation,
  useSubscription,
};
