import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"

export interface Mission {
  id: string
  userId: string
  title: string
  completed: boolean
  date: Date
  createdAt: Date
}

export async function getMissions(userId: string, date: Date): Promise<Mission[]> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const missionsRef = collection(db, "missions")
  const q = query(
    missionsRef,
    where("userId", "==", userId),
    where("date", ">=", startOfDay),
    where("date", "<=", endOfDay),
  )

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      completed: data.completed,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate(),
    }
  })
}

export async function addMission(userId: string, title: string, date: Date): Promise<string> {
  const missionsRef = collection(db, "missions")
  const docRef = await addDoc(missionsRef, {
    userId,
    title,
    completed: false,
    date,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

export async function toggleMissionStatus(missionId: string, completed: boolean): Promise<void> {
  const missionRef = doc(db, "missions", missionId)
  await updateDoc(missionRef, {
    completed,
  })
}

export async function deleteMission(missionId: string): Promise<void> {
  const missionRef = doc(db, "missions", missionId)
  await deleteDoc(missionRef)
}

