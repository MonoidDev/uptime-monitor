import { useGetUserByIdQuery } from '../graphql/client/generated'
import styles from '../styles/Home.module.css'

export default function Home() {
  const userQuery = useGetUserByIdQuery({
    variables: {
      id: 2,
    },
  })

  return (
    <div className={styles.container}>
      Hello, {userQuery.data?.user?.name} joined at {userQuery.data?.user?.createdAt}
    </div>
  )
}
