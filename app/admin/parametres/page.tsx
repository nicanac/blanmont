import { redirect } from 'next/navigation';

export default function AdminParametresRedirect() {
  redirect('/admin/settings');
}
