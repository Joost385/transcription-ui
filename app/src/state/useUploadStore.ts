import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

type UploadStatus = "success" | "error" | "loading";

type Upload = {
    id: string;
    name: string;
    progress?: number;
    status: UploadStatus;
    abort: () => void;
}

interface UploadState {
    showUploadDialog: boolean;
    handleOpenUpload: () => void;
    handleCloseUpload: () => void;
    uploads: Upload[];
    addUpload: (name: string, abort: () => void) => Upload;
    removeUpload: (id: string) => void;
    setUploadStatus: (id: string, status: UploadStatus) => void;
    setUploadProgress: (id: string, progress?: number) => void;
}

const useUploadStore = create<UploadState>()(
    set => ({
        uploads: [],
        showUploadDialog: false,
        handleOpenUpload: () => set({ showUploadDialog: true }),
        handleCloseUpload: () => set({ showUploadDialog: false }),
        addUpload: (name, abort) => {
            const upload = {
                id: uuidv4(),
                name,
                progress: 0,
                status: "loading" as UploadStatus,
                abort: abort,
            };

            set(state => ({ uploads: [...state.uploads, upload] }));

            return upload;
        },
        removeUpload: id => {
            set(state => ({
                uploads: state.uploads.filter(upload => upload.id !== id)
            }));
        },
        setUploadStatus: (id, status) => {
            set(state => ({
                uploads: state.uploads.map(upload => {
                    if (upload.id === id) {
                        return { ...upload, status };
                    }

                    return upload;
                })
            }));
        },
        setUploadProgress: (id, progress) => {
            set(state => ({
                uploads: state.uploads.map(upload => {
                    if (upload.id === id) {
                        return { ...upload, progress };
                    }

                    return upload;
                })
            }));
        }
    })
);

export default useUploadStore;