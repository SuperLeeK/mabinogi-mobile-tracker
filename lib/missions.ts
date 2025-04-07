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
  type Firestore,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Mission {
  id: string
  userId: string
  title: string
  completed: boolean
  date: Date
  createdAt: Date
}

// 안전하게 Firestore 문서 데이터를 Mission 객체로 변환하는 함수
function convertToMission(doc: QueryDocumentSnapshot<DocumentData>): Mission {
  const data = doc.data()
  return {
    id: doc.id,
    userId: data.userId || "",
    title: data.title || "",
    completed: data.completed || false,
    date: data.date?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
  }
}

// Firestore가 초기화되었는지 확인하는 함수
function getFirestore(): Firestore | null {
  if (!db) {
    console.error("Firestore is not initialized")
    return null
  }
  return db as Firestore
}

export async function getMissions(userId: string, date: Date): Promise<Mission[]> {
  const firestore = getFirestore()
  if (!firestore) return []

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  try {
    const missionsRef = collection(firestore, "missions")
    const q = query(
      missionsRef,
      where("userId", "==", userId),
      where("date", ">=", startOfDay),
      where("date", "<=", endOfDay),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(convertToMission)
  } catch (error) {
    console.error("Error getting missions:", error)
    return []
  }
}

export async function addMission(userId: string, title: string, date: Date): Promise<string> {
  const firestore = getFirestore()
  if (!firestore) return ""

  try {
    const missionsRef = collection(firestore, "missions")
    const docRef = await addDoc(missionsRef, {
      userId,
      title,
      completed: false,
      date,
      createdAt: serverTimestamp(),
    })

    return docRef.id
  } catch (error) {
    console.error("Error adding mission:", error)
    return ""
  }
}

export async function toggleMissionStatus(missionId: string, completed: boolean): Promise<boolean> {
  const firestore = getFirestore()
  if (!firestore) return false

  try {
    const missionRef = doc(firestore, "missions", missionId)
    await updateDoc(missionRef, {
      completed,
    })
    return true
  } catch (error) {
    console.error("Error toggling mission status:", error)
    return false
  }
}

export async function deleteMission(missionId: string): Promise<boolean> {
  const firestore = getFirestore()
  if (!firestore) return false

  try {
    const missionRef = doc(firestore, "missions", missionId)
    await deleteDoc(missionRef)
    return true
  } catch (error) {
    console.error("Error deleting mission:", error)
    return false
  }
}

