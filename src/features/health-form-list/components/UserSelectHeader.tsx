import { getAllUsers, UserRecord } from '@/apis/user'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select'
import { useUserStore } from '@/stores/userStore'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

interface UserSelectHeaderProps {
  selectedCreator: string
  onSelectedCreatorChange: (value: string) => void
}

export function UserSelectHeader({
  selectedCreator,
  onSelectedCreatorChange,
}: UserSelectHeaderProps) {
  const authUser = useUserStore((state) => state.authUser)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<
    UserRecord[]
  >({
    queryKey: ['users', 'all'],
    queryFn: getAllUsers,
  })

  useEffect(() => {
    if (authUser?.uid && !selectedCreator) {
      onSelectedCreatorChange(authUser.uid)
    }
  }, [authUser?.uid, onSelectedCreatorChange, selectedCreator])

  function handleSelectedCreatorChange(value: string) {
    onSelectedCreatorChange(value)
  }

  const shouldShowSelect = users.length > 1

  return (
    <div className="flex flex-row justify-between gap-3">
      {shouldShowSelect && (
        <Select
          value={selectedCreator}
          onValueChange={handleSelectedCreatorChange}
          disabled={isLoadingUsers}
        >
          <SelectTrigger className="w-64 bg-white">
            <SelectValue placeholder="Chọn user" />
          </SelectTrigger>
          <SelectContent position="popper" align="start" className="w-64">
            {users.map((user: UserRecord) => (
              <SelectItem key={user.uid} value={user.uid}>
                {user.user_name}
                {user.uid === authUser?.uid ? ' (hiện tại)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
