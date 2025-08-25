import { useSelector } from 'react-redux';
import type { RootState } from '../store';
 
export default function useCurrentUser() {
  return useSelector((state: RootState) => state.auth.user);
} 