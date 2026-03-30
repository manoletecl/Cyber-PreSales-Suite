import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Project } from "@/types/project";

function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

export async function saveProject(project: Project) {
  const cleanedEstimatedLicenses = removeUndefined(
    project.results?.estimatedLicenses ?? {}
  );

  const payload = {
    ...project,
    results: project.results
      ? {
          ...project.results,
          estimatedLicenses: cleanedEstimatedLicenses,
        }
      : undefined,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "projects"), payload);

  return docRef.id;
}
