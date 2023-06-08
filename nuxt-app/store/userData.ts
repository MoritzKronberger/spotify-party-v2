import { reactive } from 'vue'

interface IUser {
  id: string
  name: string
  isHost: boolean
  partyCode: string
}

const user: IUser = reactive({
  id: '',
  name: '',
  isHost: false,
  partyCode: '',
})

export default user
