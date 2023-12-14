import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

export default function ListSkeleton() {
    return (
        <>
            <Stack
                mb={2}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Skeleton
                    width={80}
                    height={30}
                    variant="rounded"
                    sx={{ borderRadius: 3 }}
                />
                <Skeleton
                    width={120}
                    height={35}
                    variant="rounded"
                    sx={{ borderRadius: 3 }}
                />
            </Stack>
            <Stack gap={2}>
                {Array.from({ length: 10 }, (_, i) => (
                    <Skeleton
                        key={i}
                        height={100}
                        variant="rounded"
                        sx={{ borderRadius: 3 }}
                    />
                ))}
            </Stack>
        </>
    );
}