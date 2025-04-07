"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { type Mission, getMissions, addMission, toggleMissionStatus, deleteMission } from "@/lib/missions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon, Trash2 } from "lucide-react"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [missions, setMissions] = useState<Mission[]>([])
  const [newMission, setNewMission] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)

  // useCallback을 사용하여 loadMissions 함수를 메모이제이션
  const loadMissions = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const missions = await getMissions(user.uid, selectedDate)
      setMissions(missions)
    } catch (error) {
      console.error("Error loading missions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedDate]) // 의존성 배열에 user와 selectedDate 포함

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadMissions()
    }
  }, [user, loadMissions]) // loadMissions를 의존성 배열에 추가

  const handleAddMission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMission.trim()) return

    try {
      const missionId = await addMission(user.uid, newMission, selectedDate)
      if (missionId) {
        setMissions([
          ...missions,
          {
            id: missionId,
            userId: user.uid,
            title: newMission,
            completed: false,
            date: selectedDate,
            createdAt: new Date(),
          },
        ])
        setNewMission("")
      }
    } catch (error) {
      console.error("Error adding mission:", error)
    }
  }

  const handleToggleStatus = async (missionId: string, completed: boolean) => {
    try {
      await toggleMissionStatus(missionId, completed)
      setMissions(missions.map((mission) => (mission.id === missionId ? { ...mission, completed } : mission)))
    } catch (error) {
      console.error("Error toggling mission status:", error)
    }
  }

  const handleDeleteMission = async (missionId: string) => {
    try {
      await deleteMission(missionId)
      setMissions(missions.filter((mission) => mission.id !== missionId))
    } catch (error) {
      console.error("Error deleting mission:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>
  }

  if (!user) {
    return null // 리디렉션이 처리되므로 아무것도 렌더링하지 않음
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">일일 미션 트래커</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">{user.displayName || user.email}</div>
          <Button variant="outline" onClick={signOut}>
            로그아웃
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-[250px_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>날짜 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ko}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                {format(selectedDate, "PPP", { locale: ko })}의 미션
              </CardTitle>
              <CardDescription>오늘 완료해야 할 미션을 추가하고 관리하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMission} className="flex gap-2 mb-6">
                <Input
                  placeholder="새 미션 추가..."
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">추가</Button>
              </form>

              {isLoading ? (
                <div className="text-center py-4">미션 로딩 중...</div>
              ) : missions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">미션이 없습니다. 새 미션을 추가해보세요!</div>
              ) : (
                <ul className="space-y-2">
                  {missions.map((mission) => (
                    <li key={mission.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={mission.completed}
                          onCheckedChange={(checked) => handleToggleStatus(mission.id, checked === true)}
                          id={`mission-${mission.id}`}
                        />
                        <label
                          htmlFor={`mission-${mission.id}`}
                          className={`${mission.completed ? "line-through text-gray-400" : ""}`}
                        >
                          {mission.title}
                        </label>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMission(mission.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="text-sm text-gray-500">
                완료된 미션: {missions.filter((m) => m.completed).length}/{missions.length}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

