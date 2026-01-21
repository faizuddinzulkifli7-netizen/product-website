import { useCallback } from 'react';

export function useConfirm() {
  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const result = window.confirm(message);
      resolve(result);
    });
  }, []);

  return { confirm };
}

