// 🔐 APA-COMPLIANT — Safe custom session fetch
import { getCurrentUser } from './getCurrentUser';

export async function getServerSession() {
  return await getCurrentUser();
}
