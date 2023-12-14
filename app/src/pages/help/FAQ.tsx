import { useState } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useContactEmail } from "../../models/User";

export default function FAQ() {
    const contactEmail = useContactEmail();
    const [expanded, setExpanded] = useState<string | null>(null);

    const handleChange = (question: string, value: boolean) => {
        setExpanded(value ? question : null);
    }

    return (
        <Box>
            <Typography
                variant="h6"
                component="h2"
                textAlign="center"
                mb={4}
            >
                Frequently Asked Questions
            </Typography>
            <Accordion
                expanded={expanded === "questsion_1"}
                onChange={(_, value) => handleChange("questsion_1", value)}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography color={
                        expanded === "questsion_1" ?
                            "primary.main" :
                            "text.primary"
                    }>
                        Why does my transcription take so long?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Transcriptions of long recordings may take several hours, depending on the system and current demand.
                        To speed up the process, you can choose a smaller whisper model or deactivate speaker detection.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion
                expanded={expanded === "questsion_2"}
                onChange={(_, value) => handleChange("questsion_2", value)}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography color={
                        expanded === "questsion_2" ?
                            "primary.main" :
                            "text.primary"
                    }>
                        How can I restart a transcription?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Transcriptions can not be restarted directly.
                        You have to delete them and start a new one.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion
                expanded={expanded === "questsion_3"}
                onChange={(_, value) => handleChange("questsion_3", value)}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography color={
                        expanded === "questsion_3" ?
                            "primary.main" :
                            "text.primary"
                    }>
                        My transcription seems stuck, what can I do?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Transcriptions of long recordings may take a long time to complete.
                        Also the system only processes a limited number of transcriptions in parallel, excess transcriptions are marked as pending.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion
                expanded={expanded === "questsion_4"}
                onChange={(_, value) => handleChange("questsion_4", value)}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography color={
                        expanded === "questsion_4" ?
                            "primary.main" :
                            "text.primary"
                    }>
                        Why has my transcription failed?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Sometimes transcriptions can fail due to technical problems.
                        In that case you should try again
                        Try again and if the problem persist, contact the administrator:
                        <Link
                            mt={2}
                            display="block"
                            href={`mailto:${contactEmail.data}`}
                        >
                            {contactEmail.data}
                        </Link>
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion
                expanded={expanded === "questsion_5"}
                onChange={(_, value) => handleChange("questsion_5", value)}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography color={
                        expanded === "questsion_5" ?
                            "primary.main" :
                            "text.primary"
                    }>
                        How can I change my password?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        To change your password you can use the password reset functionality on the login page.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Typography textAlign="center" mt={4}>
                If you need assistance please contact the administrator
                <Link
                    mt={0.5}
                    display="block"
                    href={`mailto:${contactEmail.data}`}
                >
                    {contactEmail.data}
                </Link>
            </Typography>
        </Box>
    );
}