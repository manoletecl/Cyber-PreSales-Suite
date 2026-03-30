import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function getProjects() {
  const querySnapshot = await getDocs(collection(db, "projects"));

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
