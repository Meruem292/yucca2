import { redirect } from 'next/navigation';

export default function HomePage() {
  // For demonstration purposes, redirect directly to the dashboard.
  // In a real application, this would check auth status and redirect
  // to /login or /dashboard accordingly.
  redirect('/dashboard');
  return null; // Redirect will prevent this from rendering
}
