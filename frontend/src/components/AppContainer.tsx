// import useAuth from "@/hooks/useAuth"
// import { Box, Center, Spinner } from "@chakra-ui/react"
// import { Navigate, Outlet } from "react-router-dom"
import { Box } from "@chakra-ui/react"
import UserMenu from "./UserMenu"
import { Outlet } from "react-router"


const AppContainer = () => {

    return (
        <Box p={4} minH="100vh">
            <UserMenu />
            <Outlet />
        </Box>
    )
}

export default AppContainer
