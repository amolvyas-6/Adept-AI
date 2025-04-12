import { Center, Container, Flex, Spinner } from "@chakra-ui/react";
// import { useRef, useState } from "react";
// import { useMutation } from "@tanstack/react-query";
// import { sendLink, sendPDF } from "../lib/api";
import useSession from "../lib/useSession";
import PdfForm from "../components/pdfForm";
import SyllabusForm from "../components/SyllabusForm";


const InputNotes = () => {
    const { session, isLoading, isError } = useSession()

    return (
        isLoading ? <Center w='100wh' h="90vh" flexDir="column">
            <Spinner mb={4} />
        </Center> :
        <Flex minH='100vh' align='center' justify='center'>
            <Container mx="auto" maxW="md" py={12} px={6} textAlign="center">
                {(session && !isError) ? <PdfForm /> : <SyllabusForm /> }
            </Container>
        </Flex>
    )
}

export default InputNotes;
