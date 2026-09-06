'use client';
import { useCartStore } from '../../store/useCartStore';

export default function Toast() {
  const { toastMessage } = useCartStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-anthracite text-creme px-6 py-3 shadow-2xl font-sans text-sm tracking-wide border border-sable/30 animate-fade-in">
      {toastMessage}
    </div>
  );
}