import { useQuery } from "@tanstack/react-query"
import { getSession } from "./api"


export const SESSIONS = "session"

const useSession = (opts={}) => {
    const {
        data: session=[],
        ...rest
    } = useQuery({
        queryKey: [SESSIONS],
        queryFn: getSession,
        staleTime: Infinity,
        ...opts
    })

    return {session, ...rest}
}

export default useSession